// Todo: env파일로 포트 및 환경 관리하기
const express = require('./config/express');
const {logger} = require('./config/winston');

const port = 3000;
express().listen(port);
logger.info(`${process.env.NODE_ENV} - API Server Start At Port ${port}`);