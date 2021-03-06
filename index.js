const express = require('./config/express');
const {logger} = require('./config/winston');
require('dotenv').config();

const port = process.env.PORT || 4000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);