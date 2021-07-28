const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");

const feedbackDao = require('./feedbackDao');

/**
 * update : 2021.07.25.
 * desc : 신뢰도 평가 목록 조회
 */
exports.getList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let {
        type, lodging
    } = req.query;
    type = parseInt(type, 10);
    lodging = parseInt(lodging, 10);

    if (!type || !lodging)
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));
    
    if (Number.isNaN(type) || Number.isNaN(lodging) || (type < 1 || type > 2))
        return res.json(errResponse(baseResponse.FEEDBACK_PARAMETER_INVALID));

    try {
        // 유효한 숙소인지 확인
        const isValidLodging = await feedbackDao.isValidLodging(type, lodging);
        if (isValidLodging.length == 0)
            return res.json(errResponse(baseResponse.FEEDBACK_PARAMETER_INVALID));

        try {
            let result = [];
            // 평가하지 않은 피드 목록 인덱스 조회
            const feedList = await feedbackDao.getFeedListToFeedback(type, lodging, userIndex);

            // 각각의 이미지 조회
            for (let i=0; i<feedList.length; i++) {
                let feedIndex = feedList[i].feedIndex;
                
                let nickname = feedList[i].nickname;
                let avatarUrl = feedList[i].avatraUrl || "";
                let sourceRows = await feedbackDao.getImageByFeedIndex(feedIndex);
                
                let feedInfo = {
                    feedIndex,
                    avatarUrl,
                    nickname,
                    sources: sourceRows
                };

                result.push(feedInfo);
            }
            return res.send(response(baseResponse.SUCCESS, result));
        } catch(err) {
            logger.error(`신뢰도 평가 목록 조회 - 숙소 조회 중 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
    } catch(err) {
        logger.error(`신뢰도 평가 목록 조회 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.25.
 * desc : 신뢰도 평가
 */
 exports.createFeedback = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    const {
        feedbacks
    } = req.body;

    if (!feedbacks || feedbacks.length == 0)
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));

    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        for (let i=0; i<feedbacks.length; i++) {
            try {
                // 유효한 피드인지 확인
                let feedIndex = feedbacks[i].feedIndex
                const isValidFeed = await feedbackDao.isExistFeed(feedIndex);
                if (isValidFeed.length == 0)
                    return res.json(errResponse(baseResponse.FEED_EMPTY));
                
                // degree 확인
                let degree = parseInt(feedbacks[i].degree);
                if (Number.isNaN(degree) || (degree < 1 || degree > 5))
                    return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
                
                // 신뢰도 평가 저장
                await feedbackDao.createFeedback(connection, userIndex, feedIndex, degree);

            } catch(err) {
                logger.error(`신뢰도 평가 목록 조회 - 숙소 조회 중 DB Error\n: ${JSON.stringify(err)}`);
                return res.json(errResponse(baseResponse.DB_ERROR));
            }
        }

        // 성공
        await connection.commit();
        const result = {
            count: feedbacks.length
        };
        return res.send(response(baseResponse.SUCCESS, result));
    } catch(err) {
        logger.error(`신뢰도 평가 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    } finally {
        connection.release();
    }
};