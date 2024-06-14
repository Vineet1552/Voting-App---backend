require('dotenv').config();
const mongoose = require('mongoose');

const mongoURL = process.env.DB_URL;

mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on('connected', () => {
    console.log('connected with Database successfully!');
})

db.on('error', (error) => {
    console.log('error occured during the connection with DataBase!');
})

db.on('disconnected', () => {
    console.log('disconnected with Databse Successfully!');
})

module.exports = db;