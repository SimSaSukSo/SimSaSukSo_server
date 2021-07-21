const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");

const listDao = require('./listDao');
const feedPerPage = 24;

/**
 * update : 2021.07.17.
 * desc : 찜 목록 제공 API
 */
exports.allList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let result = [];
    try {
        try {
            const savedListRows = await listDao.getSavedList(userIndex);
        
            if (savedListRows.length != 0) {
                let element;
                for (let i=0; i<savedListRows.length; i++) {
                    const savedListIndex = savedListRows[i].savedListIndex;
                    const title = savedListRows[i].title;
                    const getSourceAtSavedList = await listDao.getSourceAtSavedList(savedListIndex);
                    let sources = [];
                    for (let j=0; j<getSourceAtSavedList.length; j++) { sources.push(getSourceAtSavedList[j].source); }
                    element = {
                        savedListIndex,
                        title,
                        sources
                    };
                    result.push(element);
                }
            }
        } catch(err) {
            logger.error(`찜 목록 제공 DB 조회 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        return res.send(response(baseResponse.SUCCESS, result));
    } catch (err) {
        logger.error(`찜 목록 제공 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.17.
 * desc : 찜 목록 생성 API
 */
 exports.newList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    const title = req.body.title;
    if (!title) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));

    try {
        try {
            await listDao.createSavedList(userIndex, title);
        } catch(err) {
            logger.error(`찜 목록 생성 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        logger.error(`찜 목록 생성 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.17.
 * desc : 찜 목록 수정 API
 */
exports.updateList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let savedListIndex = req.body.savedListIndex;
    let title = req.body.title;

    savedListIndex = parseInt(savedListIndex, 10);
    
    if (!title || !savedListIndex || Number.isNaN(savedListIndex))
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));

    try {
        try {
            // 유저 찜 목록 조회
            const userSavedListRow = await listDao.getSavedList(userIndex);
            let userSavedList = [];
            userSavedListRow.forEach(element => { userSavedList.push(element.savedListIndex); });
            const userSavedListSet = new Set(userSavedList);

            if (!userSavedListSet.has(savedListIndex))
                return res.json(errResponse(baseResponse.SL_PARAMETER_INVALID));

            // 찜 목록 수정
            await listDao.updateSavedList(savedListIndex, title, userIndex);
            return res.send(response(baseResponse.SUCCESS));
        } catch(err) {
            logger.error(`찜 목록 수정 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
    } catch (err) {
        logger.error(`찜 목록 수정 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.17.
 * desc : 찜 목록 삭제 API
 */
 exports.deleteList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let idx = req.params.idx;
    const savedListIndex = parseInt(idx, 10);

    if (!savedListIndex || Number.isNaN(savedListIndex)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID))

    try {
        try {
            // 유저 찜 목록 조회
            const userSavedListRow = await listDao.getSavedList(userIndex);
            let userSavedList = [];
            userSavedListRow.forEach(element => { userSavedList.push(element.savedListIndex); });
            const userSavedListSet = new Set(userSavedList);

            if (userSavedListSet.has(savedListIndex)) {
                // 찜 목록 삭제
                await listDao.deleteSavedList(savedListIndex, userIndex);
                return res.send(response(baseResponse.SUCCESS));
            } else {
                return res.json(errResponse(baseResponse.SL_PARAMETER_INVALID));
            }
        } catch(err) {
            logger.error(`찜 목록 삭제 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
    } catch (err) {
        logger.error(`찜 목록 삭제 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.19.
 * desc : 특정 찜 목록 조회 API
 */
 exports.feedsInSavedList = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let idx = req.params.idx;
    const savedListIndex = parseInt(idx, 10);
    let title;

    // 페이지 유효성 검사
    let page = req.query.page;

    if (!page) page = 1;
    page = parseInt(page, 10);
    if (Number.isNaN(page)) return res.json(errResponse(baseResponse.PAGE_WRONG));
    
    if (!savedListIndex || Number.isNaN(savedListIndex)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID))

    try {
        try {
            // 유저 찜 목록 조회
            const userSavedListRow = await listDao.getTitleOfSavedList(userIndex, savedListIndex);

            if (userSavedListRow.length != 0) {
                // 특정 찜 목록 조회
                title = userSavedListRow[0].title;
                const feeds = await listDao.getFeedsOfSavedList(savedListIndex, (page-1) * feedPerPage);
                const result = { title, feeds };
                return res.send(response(baseResponse.SUCCESS, result));
            } else {
                return res.json(errResponse(baseResponse.SL_PARAMETER_INVALID));
            }
        } catch(err) {
            logger.error(`특정 찜 목록 조회 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
    } catch (err) {
        logger.error(`특정 찜 목록 조회 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};