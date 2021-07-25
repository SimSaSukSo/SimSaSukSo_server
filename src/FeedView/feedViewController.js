const jwtMiddleware = require("../../config/jwtMiddleware");
const feedViewProvider = require("../../src/FeedView/feedViewProvider");
const {logger} = require("../../config/winston");
const feedViewService = require("../../src/FeedView/feedViewService");
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");
const axios = require("axios");
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const jwt = require("jsonwebtoken");
const secret_config = require("../../config/secret");

/**
 * API No. 20
 * API Name : 피드 정보 조회
 * [GET] /api/feeds/:idx
 */
exports.getFeed = async function (req, res) {

    const token = req.verifiedToken
    const userIndex = token.userIndex
    const feedIndex = req.params.idx

    try {
        const feedInfoResult = await feedViewProvider.retriveFeedInfo(userIndex, feedIndex);

        if (!feedInfoResult) {
            return res.json(errResponse(baseResponse.FEED_EMPTY));
        } else {
            return res.send(response(baseResponse.SUCCESS, feedInfoResult));
        }
    } catch (err) {
        console.log(err);
        logger.error(`피드 정보 조회 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
};

/**
 * API No. 21
 * API Name : 피드 정보 조회
 * [GET] /api/feeds/:idx/comments
 */
exports.getComment = async function (req, res) {

    const token = req.verifiedToken
    const userIndex = token.userIndex
    const feedIndex = req.params.idx

    try {
        const feedCommentResult = await feedViewProvider.retriveFeedComment(userIndex, feedIndex);

        if (feedCommentResult.length == 0) {
            return res.json(errResponse(baseResponse.FEED_COMMENT_EMPTY));
        } else {
            return res.send(response(baseResponse.SUCCESS, feedCommentResult));
        }
    } catch (err) {
        console.log(err);
        logger.error(`피드 정보 조회 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}