
const models = require('../models');
const bcrypt = require('bcrypt');

const userController = {
    getUsers: async (req, res) => {
        try {
            const id = req.params.id;

            const users = await models.User.findAll({
                where: id ? { id: id } : {},
            });

            if (!users || users.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const usersData = users.map(user => ({
                id: user.id,
                login: user.login,
                name: user.name,
                is_active: user.is_active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            res.status(200).json(usersData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },
    updateUser: async (req, res) => {
        try {
            const id = req.params.id;
            const { name, is_active, password } = req.body;

            const isAdmin = req.query.who === 'admin';

            const user = await models.User.findByPk(id);
            if (!user) {
            return res.status(404).json({ error: 'User not found' });
            }

            // обычные поля
            if (name !== undefined) {
                user.name = name;
            }

            if (is_active !== undefined) {
                user.is_active = user.login === 'admin' ? true : is_active;
            }

            // 🔐 пароль — ТОЛЬКО для админа
            if (password !== undefined) {
                if (!isAdmin) {
                    return res.status(403).json({
                    error: 'Only admin can change password'
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }

            await user.save();

            res.status(200).json({
                id: user.id,
                name: user.name,
                is_active: user.is_active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    },
    deleteUser: async (req, res) => {
        try {
            const id = req.params.id;

            const user = await models.User.findByPk(id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            await user.destroy();

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
};

module.exports = userController;