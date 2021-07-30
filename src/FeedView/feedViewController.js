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

        if (feedInfoResult["feedImage"].length == 0) {
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

    const token = req.verifiedToken;
    const userIndex = token.userIndex;
    const feedIndex = req.params.idx;

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

/**
 * API No. 21
 * API Name : 검색 API
 * [GET] /api/feeds/search
 */
exports.getSearch = async function (req, res) {

    /**
     * Body: pros, cons, locationIndex, minPrice, maxPrice, interval
     */
    let {pros, cons, locationIdx, minPrice, maxPrice, interval} = req.body;

    //const token = req.verification;
    //const userIndex = token.userIndex;

    if(!locationIdx) {
        return res.json(errResponse(baseResponse.SEARCH_LOCATION_EMPTY));
    }
    if (interval != "year" && interval != "month" && interval != "week" && interval != "day" && interval != "hour") {
        return res.json(errResponse(baseResponse.INTERVAL_INVALID));
    }

    
    if (!minPrice) {
        minPrice = 0;
    }
    if (!maxPrice) {
         maxPrice = 2147483647;
    }

    if (cons.length == 0) {
      cons = [0];
    }

    try {
        const feedSearchResult = await feedViewProvider.retrieveSearch(pros, cons, locationIdx, minPrice, maxPrice, interval);

        if (feedSearchResult.length == 0) {
            return res.json(errResponse(baseResponse.FEED_EMPTY));
        } else {
            return res.send(response(baseResponse.SUCCESS, feedSearchResult));
        }

    } catch (err) {
        console.log(err);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }

}

exports.like = async function(req, res) {
    const token = req.verification;
    const userIndex = token.userIndex;

    const {feedIndex} = req.body;

    try {
        const feedLikeResult = await feedViewProvider.feedLike(userIndex, feedIndex);
        return res.send(response(baseResponse.SUCCESS));
        
    } catch (err) {
        console.log(err);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.dislike = async function(req, res) {
    const token = req.verification;
    const userIndex = token.userIndex;

    const {feedIndex} = req.body;

    try {
        const feedUnLikeResult = await feedViewProvider.feedDislike(userIndex, feedIndex);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        console.log(err);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.postComment = async function(req, res) {
    const token = req.verification;
    const userIndex = token.userIndex;
    const feedIndex = req.params.idx;

    const {content} = req.body;

    try {
        const postCommentResult = await feedViewService.feedPostComment(userIndex, feedIndex, content);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        console.log(err);
        console.log('댓글 작성 API 중 에러');
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.putComment = async function(req, res) {
    const token = req.verification;
    const userIndex = token.userIndex;
    const feedIndex = req.params.idx;

    const {content, commentIndex} = req.body;
    
    try {
        const putCommentResult = await feedViewService.feedPutComment(content, userIndex, commentIndex, feedIndex);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        console.log(err);
        console.log('댓글 수정 API 중 에러');
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.deleteComment = async function(req, res) {
    const token = req.verification;
    const userIndex = token.userIndex;
    const feedIndex = req.params.idx;

    const {commentIndex} = req.body;

    try {
        const deleteCommentResult = await feedViewService.feedDeleteComment(userIndex, commentIndex, feedIndex);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        console.log(err);
        console.log('댓글 삭제 API 중 에러');
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}