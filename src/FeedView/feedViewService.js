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

exports.feedDeleteComment = async function(userIndex, commentIndex, feedIndex) {d
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


exports.feedReport = async function(userIndex, feedIndex) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const params = [userIndex, feedIndex];

        const isExistFeed = await feedViewDao.selectFeed(connection, feedIndex);

        const reportCount = await feedViewDao.selectUserFeedReport(connection, params);

        if (isExistFeed.length == 0) {
            return errResponse(baseResponse.FEED_EMPTY);
        }
        else if(reportCount.length >= 1) {
            return errResponse(baseResponse.FEEDREPORT_REDUNDANT);
        } else {
            const reportFeedResult = await feedViewDao.reportFeed(connection, params);

            const selectReportResult = await feedViewDao.selectReportFeed(connection, feedIndex);
    
            // 신고 횟수가 10이 넘으면 피드 삭제
            if (selectReportResult.length >= 10) {
                const deleteReportFeedResult = await feedViewDao.deleteReportFeed(connection, feedIndex);
    
                const selectReportCommentResult = await feedViewDao.selectReportComment(connection, feedIndex);
    
                for (var i = 0; i< selectReportCommentResult.length; i ++) {
                    const deleteReportCommentLikeResult = await feedViewDao.deleteReportCommentLike(connection, selectReportCommentResult[i].commentIndex);
                }
    
                const deleteReportCommentResult = await feedViewDao.deleteReportComment(connection, feedIndex);
                const deleteReportFeedImageResult = await feedViewDao.deleteReportFeedImage(connection, feedIndex);
                const deleteReportFeedLikeResult = await feedViewDao.deleteReportFeedLike(connection, feedIndex);
                const deleteReportFeedProsAndConsResult = await feedViewDao.deleteReportFeedProsAndCons(connection, feedIndex);
                const deleteReportFeedTagResult = await feedViewDao.deleteReportFeedTag(connection, feedIndex);
                const deleteReportFeedToolResult = await feedViewDao.deleteReportFeedTool(connection, feedIndex);
                const deleteReportReliabilityResult = await feedViewDao.deleteReportReliability(connection, feedIndex);
                const deleteReportSavedFeedResult = await feedViewDao.deleteReportSavedFeed(connection, feedIndex);
            }
        }
        connection.release();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - ReportFeed Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};