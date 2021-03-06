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
const { USER_ID_NOT_MATCH, LOGIN_SUCCESS } = require("../../config/baseResponseStatus");

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

        let userIndex_to;

        const [userIndex_to_] = await feedViewDao.selectUserIndex_to(connection, feedIndex);
        if(userIndex_to_) {
            userIndex_to = userIndex_to_.userIndex;
        } else {
            return errResponse(baseResponse.FEED_EMPTY);
        }
        

        const params = [userIndex, feedIndex, userIndex_to];
        const params_ = [userIndex, feedIndex];

        const isExistFeed = await feedViewDao.selectFeed(connection, feedIndex);

        const reportCount = await feedViewDao.selectUserFeedReport(connection, params_);

        if (isExistFeed.length == 0) {
            return errResponse(baseResponse.FEED_EMPTY);
        }
        else if(reportCount.length >= 1) {
            return errResponse(baseResponse.FEEDREPORT_REDUNDANT);
        } else {
            const reportFeedResult = await feedViewDao.reportFeed(connection, params);

            const userReportFeedCount = await feedViewDao.selectUserReportFeedCount(connection, userIndex_to);

            if(userReportFeedCount.length >= 5) {
                // user status suspended
                const suspendUserResult = await feedViewDao.suspendUser(connection, userIndex_to);
            }

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

exports.feedCommentLike = async function(userIndex, commentIndex) {
    const connection = await pool.getConnection(async (conn) => conn);

    const param = [userIndex, commentIndex];

    const selectLikeComment = await feedViewDao.selectFeedCommentLike(connection, param);

    let likeResult;
    if (selectLikeComment.length == 0) {
      likeResult = await feedViewDao.insertFeedCommentLike(connection, param);
      console.log('insert');
    } else {
      likeResult = await feedViewDao.updateFeedCommentLike(connection, param);
      console.log('update')
    }

    connection.release();

    return likeResult;
    
  };

  exports.feedCommentDislike = async function(userIndex, commentIndex) {
    const connection = await pool.getConnection(async (conn) => conn);

    const param = [userIndex, commentIndex];
    
    const unlikeCommentResult = await feedViewDao.updateFeedCommentDislike(connection, param);

    connection.release();

    return unlikeCommentResult;
  };