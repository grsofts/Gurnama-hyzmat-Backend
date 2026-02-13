const express = require('express')
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require('path');

const PORT = 5000;
const api = '/api';
const app = express();

// Разрешаем все origins (для разработки)
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3005',
        'http://192.168.0.34:3005'
    ],
    credentials: true
}));

const servicesRouter = require('./routes/services.js');
const authRouter = require('./routes/auth.js');
const certificatesRouter = require('./routes/certificates.js');
const slidersRouter = require('./routes/sliders.js');
const usersRouter = require('./routes/users.js');
const projectsRouter = require('./routes/projects.js');
const partnersRouter = require('./routes/partners.js');
const aboutRouter = require('./routes/about.js');
const contactsRouter = require('./routes/contacts.js');
const mailRouter = require('./routes/mail.js')

app.use(express.json());
app.use(cookieParser());


app.use(api, servicesRouter);
app.use(api, authRouter);
app.use(api, usersRouter);
app.use(api, slidersRouter);
app.use(api, certificatesRouter);
app.use(api, projectsRouter);
app.use(api, partnersRouter);
app.use(api, aboutRouter);
app.use(api, contactsRouter);
app.use(api, mailRouter);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(PORT,'0.0.0.0',()=> console.log('Server is running on port ' + PORT));