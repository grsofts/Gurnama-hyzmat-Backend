const express = require('express')

const PORT = 5000;
const api = '/api';
const app = express();

const servicesRouter = require('./routes/services.js');
const authRouter = require('./routes/auth.js');
const slidersRouter = require('./routes/sliders.js');
app.use(express.json());


app.use(api, servicesRouter);
app.use(api, authRouter);
app.use(api, slidersRouter);


app.listen(PORT, ()=> console.log('Server is running on port ' + PORT));