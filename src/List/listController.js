const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");

const listDao = require('./listDao');

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
        await listDao.createSavedList(userIndex, title);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        logger.error(`찜 목록 생성 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};