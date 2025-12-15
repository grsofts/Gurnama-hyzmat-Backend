
const models = require('../models');

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
    }
};

module.exports = userController;