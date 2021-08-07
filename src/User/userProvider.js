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

exports.retrieveUserKakaoId = async function (kakaoId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserKaKaoId(connection, kakaoId);

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

exports.retrieveUserByuserIndex = async function(userIndex) {
  const connection = await pool.getConnection(async (conn) => conn);
  const [userResult] = await userDao.selectUserId(connection, userIndex);
  connection.release();

  return userResult;
}

exports.retrieveKakaoStatus = async function(kakaoId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userStatusResult = await userDao.selectUserStatus1(connection, kakaoId);

  connection.release();

  return userStatusResult;
}

exports.retrieveAppleStatus = async function(appleId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userStatusResult = await userDao.selectUserStatus2(connection, appleId);

  connection.release();

  return userStatusResult;
}