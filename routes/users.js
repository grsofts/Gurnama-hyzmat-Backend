const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const verify = require('../middleware/verify');

router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUsers);
router.put('/users/:id', verify, usersController.updateUser);
router.delete('/users/:id', verify, usersController.deleteUser);

module.exports = router;