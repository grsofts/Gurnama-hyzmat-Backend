const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const verify = require('../middleware/verify');

router.get('/users', verify, usersController.getUsers);
router.get('/users/:id', verify, usersController.getUsers);

module.exports = router;