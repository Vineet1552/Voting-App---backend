require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./db');

const PORT = process.env.PORT;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const userRoute = require("./Routes/userRoutes");
const candidateRoute = require('./Routes/candidateRoute');

app.use('/user', userRoute);
app.use('/candidate', candidateRoute);

app.listen(PORT, () => {
    console.log(`App is litning on the port : ${PORT}`);
})