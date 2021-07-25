// Todo: env 파일로 관리
const mysql = require('mysql2/promise');
const {logger} = require('./winston');

const pool = mysql.createPool({
    host: '',
    user: '',
    port: ,
    password: '',
    database: ''
});

module.exports = {
    pool: pool
};