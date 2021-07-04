const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

// 카카오 소셜 로그인 / 회원가입
exports.kakaoCreateUser = async function (nickname, kaokaoId, avartarUrl, email) {
    try {
         // 기존 회원인지 확인
         const connection = await pool.getConnection(async (conn) => conn);
         const emailResult = await userDao.selectUserEmail(connection, email);
         connection.release();

         const insertUserInfoParams = [nickname, kaokaoId, avartarUrl, email];

        // 가입된 회원이 없는 경우
        if(!emailResult[0]){
            //회원가입
            const connection = await pool.getConnection(async (conn) => conn);
            const signUpResult = await userDao.insertUserInfo(connection,insertUserInfoParams);
            connection.release();
            return response(baseResponse.SUCCESS);
        } 
    } catch (err) {
        logger.error(`App - kakaoCreateUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};