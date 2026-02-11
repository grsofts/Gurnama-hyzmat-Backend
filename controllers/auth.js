
const models = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { where } = require('sequelize');

const authController = {
  Login: async (req, res) => {
    try {
      const { login, password } = req.body;

      if (!login || !password) return res.status(400).json({ message: "Введите логин и пароль" });

      const user = await models.User.findOne({ where: { login:login, is_active:true } });
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

      // Access token
      const accessToken = jwt.sign(
        { id: user.id, login: user.login },
        process.env.JWT_SECRET,
        { expiresIn: "2m" }
      );

      // Refresh token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET,
        { expiresIn: "30d" }
      );

      //hash refresh token перед сохранением в базу
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

      // Сохраняем refresh token в базе
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await models.RefreshToken.destroy({ where: { user_id: user.id } });

      await models.RefreshToken.create({
        token: hashedRefreshToken,
        user_id: user.id,
        expires_at: expiresAt
      });

      // ставим refresh token в httpOnly cookie maxAge = expiresAt
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: false, // true в продакшене HTTPS
        sameSite: "lax",
        path: "/api/refresh",
        maxAge: 30 * 24 * 60 * 60 * 1000
      });

      return res.json({
        message: "Успешный вход",
        accessToken,
        user: { id: user.id, username: user.username, role: user.role }
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  },
  //check login isset with access token
  Me: async (req, res) => {
    try {

      const user = await models.User.findOne({ where: { id: req.user.id, is_active: true } });
      if (!user) return res.status(404).json({ message: "Пользователь не найден" });

      return res.json({ id: user.id, username: user.login, name: user.name });

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
      const refreshToken = req.cookies.refresh_token;
      
      if (!refreshToken) return res.status(400).json({ message: "Refresh token обязателен" });

      // Проверяем в базе
      const tokenEntry = await models.RefreshToken.findAll();
      if (!tokenEntry) return res.status(401).json({ message: "Неверный refresh token" });

      let matchedToken = null;
      for (const t of tokenEntry) {
        if (await bcrypt.compare(refreshToken, t.token)) {
          matchedToken = t;
          break;
        }
      }

      if (!matchedToken) {
        // reuse detection или ошибка
        return res.status(401).json({ message: "Неверный или просроченный refresh token" });
      }

      const user = await models.User.findByPk(matchedToken.user_id);
      
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