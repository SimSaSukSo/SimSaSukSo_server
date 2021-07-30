const {logger} = require("../../config/winston");
const {pool} = require("../../config/database");
const secret_config = require("../../config/secret");
const feedViewProvider = require("./feedViewProvider");
const feedViewDao = require("./feedViewDao");
const baseResponse = require("../../config/baseResponseStatus");
const {response} = require("../../config/response");
const {errResponse} = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {connect} = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리

exports.feedPostComment = async function(userIndex, feedIndex, content) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const insertParams = [userIndex, feedIndex, content];
        const postCommentResult = await feedViewDao.postFeedComment(connection, insertParams);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch(err) {
        logger.error(`App - feedPostComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.feedPutComment = async function(content, userIndex, commentIndex, feedIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const updateParams = [content, userIndex, commentIndex, feedIndex];
        const putCommentResult = await feedViewDao.putFeedComment(connection, updateParams);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch(err) {
        logger.error(`App - feedPutComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

exports.feedDeleteComment = async function(userIndex, commentIndex, feedIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        
        const deleteParams = [userIndex, commentIndex, feedIndex];
        const deleteCommentResult = await feedViewDao.deleteFeedComment(connection, deleteParams);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch(err) {
        logger.error(`App - feedDeleteComment Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};