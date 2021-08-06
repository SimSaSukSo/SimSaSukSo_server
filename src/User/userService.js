const {logger} = require("../../config/winston");
const {pool} = require("../../config/database");
const secret_config = require("../../config/secret");
const userProvider = require("./userProvider");
const userDao = require("./userDao");
const baseResponse = require("../../config/baseResponseStatus");
const {response} = require("../../config/response");
const {errResponse} = require("../../config/response");

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
            const [signUpResult] = await userDao.insertUserInfo(connection,insertUserInfoParams);
            
            connection.release();

            if(signUpResult) {
                return signUpResult["insertId"];
            } else {
                return response(baseResponse.SUCCESS);
            }
        } 
    } catch (err) {
        logger.error(`App - kakaoCreateUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 애플 회원가입
exports.appleCreateUser = async function (nickname, appleId, email) {
    try {
        const insertUserInfoParams = [nickname, appleId, email];

        //회원가입
        const connection = await pool.getConnection(async (conn) => conn);
        const signUpResult = await userDao.insertUserInfoByApple(connection, insertUserInfoParams);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - appleCreateUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// 닉네임 설정
exports.setNickname = async function(nickname, userIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertUserInfoParams = [nickname, userIndex];
        const setNicknameResult = await userDao.updateUserNickname(connection, insertUserInfoParams);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - setNickname Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.updatePrfileUrl = async function(profileUrl, userIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertUserInfoParams = [profileUrl, userIndex];
        const updateUserProfileResult = await userDao.updateUserProfile(connection, insertUserInfoParams);
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - setUserProfile Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.deleteUser = async function(userIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const deleteUserResult0 = await userDao.deleteUser0(connection, userIndex);
        const deleteUserResult1 = await userDao.deleteUser1(connection, userIndex);
        const deleteUserResult2 = await userDao.deleteUser2(connection, userIndex);
        const deleteUserResult3 = await userDao.deleteUser3(connection, userIndex);
        const deleteUserResult4 = await userDao.deleteUser4(connection, userIndex);
        const deleteUserResult5 = await userDao.deleteUser5(connection, userIndex);
        const deleteUserResult6 = await userDao.deleteUser6(connection, userIndex);
        const deleteUserResult7 = await userDao.deleteUser7(connection, userIndex);
        const deleteUserResult8 = await userDao.deleteUser8(connection, userIndex);

        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - deleteUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
