const express = require('express');
const rateLimit = require("express-rate-limit");
const router = express.Router();

const mailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 писем с одного IP
  message: "Too many requests from this IP"
});

const mailController = require('../controllers/mail');

router.post('/send_mail', mailLimiter, mailController.sendMail);

module.exports = router;