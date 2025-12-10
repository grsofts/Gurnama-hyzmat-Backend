
const models = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
  Login: async (req, res) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) return res.status(400).json({ message: "Введите логин и пароль" });

      const user = await models.User.findOne({ where: { login } });
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

      // Access token
      const accessToken = jwt.sign(
        { id: user.id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // Refresh token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: "30d" }
      );

      // Сохраняем refresh token в базе
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await models.RefreshToken.create({
        token: refreshToken,
        user_id: user.id,
        expires_at: expiresAt
      });

      return res.json({
        message: "Успешный вход",
        accessToken,
        refreshToken,
        user: { id: user.id, username: user.username, role: user.role }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  },
  Register: async (req, res) => {
    try {
      const { login, name, password, is_active } = req.body;

      if (!login || !password) {
        return res.status(400).json({ message: "Логин и пароль обязательны" });
      }

      // Проверяем, есть ли такой пользователь
      const existing = await models.User.findOne({ where: { login } });
      if (existing) {
        return res.status(400).json({ message: "Пользователь уже существует" });
      }

      // Хэшируем пароль
      const hash = await bcrypt.hash(password, 10);

      const user = await models.User.create({
        login,
        name,
        password: hash,
        is_active: is_active !== undefined ? is_active : true,
      });

      return res.json({ message: "Пользователь создан", user: { id: user.id, login, name, is_active: user.is_active } });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  },
  Refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ message: "Refresh token обязателен" });

      // Проверяем в базе
      const tokenEntry = await models.RefreshToken.findOne({ where: { token: refreshToken } });
      if (!tokenEntry) return res.status(401).json({ message: "Неверный refresh token" });

      // Проверяем подпись
      let payload;
      try {
        payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      } catch {
        return res.status(401).json({ message: "Неверный или просроченный refresh token" });
      }

      const user = await models.User.findByPk(payload.id);
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      // Генерируем новый access token
      const accessToken = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.json({ accessToken });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }
};
module.exports = authController;