const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const verify = require('../middleware/verify');

router.post('/login', authController.Login);
router.get('/me', verify, authController.Me);
router.post('/register', verify, authController.Register);
router.post('/refresh', authController.Refresh);

module.exports = router;
