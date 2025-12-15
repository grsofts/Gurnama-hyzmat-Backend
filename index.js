const express = require('express')
const cors = require('cors');
const cookieParser = require("cookie-parser");

const PORT = 5000;
const api = '/api';
const app = express();

// Разрешаем все origins (для разработки)
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const servicesRouter = require('./routes/services.js');
const authRouter = require('./routes/auth.js');
const slidersRouter = require('./routes/sliders.js');
const usersRouter = require('./routes/users.js');
app.use(express.json());
app.use(cookieParser());


app.use(api, servicesRouter);
app.use(api, authRouter);
app.use(api, usersRouter);
app.use(api, slidersRouter);


app.listen(PORT, ()=> console.log('Server is running on port ' + PORT));