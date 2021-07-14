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
 * API No. 10
 * API Name : 피드 정보 조회
 * [GET] /api/feedView/:idx
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