const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUser = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserEmail(connection, email);

  connection.release();

  return userResult;
};

exports.retrieveNickname = async function(nickname) {
  const connection = await pool.getConnection(async (conn) => conn);
  const [nicknameResult] = await userDao.selectUserNickname(connection, nickname);
  connection.release();

  return nicknameResult;
};

exports.retrieveUserByAppleId = async function(appleId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const [appleResult] = await userDao.selectUserApple(connection, appleId);
  connection.release();

  return appleResult;
};
