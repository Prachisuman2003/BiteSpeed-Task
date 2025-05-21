const express = require('express');
const app = express();
const identifyRouter = require('./routes/identify');

app.use(express.json());
app.use('/identify', identifyRouter);

module.exports = app;
