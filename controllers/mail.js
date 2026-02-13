
const mailController = {
    sendMail: async (req, res) => {
        try {
            const { username, email, subject, message, captchaToken  } = req.body;

            if (!email || !subject || !message || !captchaToken) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

             // Проверка капчи
            const verify = await axios.post(
                `https://www.google.com/recaptcha/api/siteverify`,
                null,
                {
                    params: {
                        secret: process.env.CAPTCHA_SECRET,
                        response: captchaToken
                    }
                }
            );

            if (!verify.data.success) {
            return res.status(403).json({ message: "Captcha failed" });
            }

            const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
            });

            await transporter.sendMail({
            from: `"Website Form" <your@email.com>`,
            to: "your@email.com",
            replyTo: email,
            subject: subject,
            html: `
                <h3>New Contact Message</h3>
                <p><strong>Name:</strong> ${username}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong><br/> ${message}</p>
            `
            });

            res.json({ message: 'Email sent successfully' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Email sending failed' });
        }
    }
}

module.exports = mailController;
