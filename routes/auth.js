const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/login', authController.Login);
router.post('/register', authController.Register);
router.post('/refresh', authController.Refresh);

module.exports = router;
