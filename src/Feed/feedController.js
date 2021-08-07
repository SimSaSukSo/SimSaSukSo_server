const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");

const feedDao = require('./feedDao');
const date = require('../util/date');
const location = require('../util/location');

const feedPerPage = 24;

/**
 * update : 2021.06.29.
 * desc : 홈 화면 제공 API
 */
exports.index = async function (req, res) {
    // 클라이언트에게 지역명 입력 받음
    let locationId = req.query.region;
    locationId = parseInt(locationId, 10);

    // 유효성 검사
    if (!locationId) return res.json(errResponse(baseResponse.REGION_EMPTY));
    if (Number.isNaN(locationId)) return res.json(errResponse(baseResponse.REGION_WRONG));
    if (locationId != 2000) {
        if (locationId < 1000 || locationId > 1015) return res.json(errResponse(baseResponse.REGION_WRONG));
    }
    
    // 지역명, 지역 범위 추출
    const regionName = location.getRegionNameByLocationId(locationId);
    const locationRange = location.getLocationRangeByLocationId(locationId);

    /**
     * Todo (when 210629)
     * 1. 피드 제공 알고리즘에 따라 코드 수정 필요
     * 2. 현재는 존재하는 숙소 5개 제공
     */
    try {
        // 입력받을 row : 대세 호텔, 지역 TOP 5, 급상승 숙소, 좋아요 많은, 신뢰도 높은
        let hotPlaces;
        let regionPlaces;
        let trendPlaces;
        let likePlaces;
        let believePlaces;
        
        // 요즘 대세 호텔 조회
        try {
            hotPlaces = await feedDao.getHotFive();
        } catch (err) {
            logger.error(`요즘 대세 호텔 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 지역 TOP 5 조회
        try {
            regionPlaces = await feedDao.getRegionHotFive(locationId, locationRange);
        } catch (err) {
            logger.error(`지역 TOP 5 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 급상승 숙소 조회
        try {
            trendPlaces = await feedDao.getTrend();
        } catch (err) {
            logger.error(`급상승 숙소 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 좋아요가 많은 게시글 조회
        try {
            likePlaces = await feedDao.getHotFive();
        } catch (err) {
            logger.error(`좋아요가 많은 게시글 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 신뢰도가 높은 게시글 조회
        try {
            believePlaces = await feedDao.getbelievePlaces();
        } catch (err) {
            logger.error(`신뢰도가 높은 게시글 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 반환 형태 정의
        const result = {
            hotPlaces,
            regionName,
            regionPlaces,
            trendPlaces,
            likePlaces,
            believePlaces
        };

        // 홈 화면 조회 성공
        return res.json(response(baseResponse.SUCCESS, result));

    } catch (err) {
        logger.error(`홈 화면 제공 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.06.30.
 * desc : 인기 피드 제공 API
 */
exports.hot = async function (req, res) {
    // 페이지 유효성 검사
    let page = req.query.page;

    if (!page) page = 1;

    page = parseInt(page, 10);
    if (Number.isNaN(page) || page < 1) return res.json(errResponse(baseResponse.PAGE_WRONG));

    try {
        // 인기 해시태그, 피드 제공 + 페이징
        let hashTags;
        let feeds;

        /**
         * Todo (when 210630)
         * 1. 인기 해시태그 선정 방법
         * 2. 각 해시태그에 대한 background image 선정 방법
         * 3. 인기 피드 선정 방법
         */
        // 인기 해시태그 조회
        try {
            hashTags = await feedDao.hotFeedHotHashTagTest();
        } catch (err) {
            logger.error(`인기 해시태그 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 페이지에 따라서 피드 조회
        try {
            feeds = await feedDao.hotFeedTest((page-1) * feedPerPage);
        } catch (err) {
            logger.error(`인기 피드 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 마지막 페이지인지
        let isLast = false;
        if (feeds.length < feedPerPage)
            isLast = true;

        const result = {
            hashTags,
            feeds,
            isLast
        };

        // 인기 피드 조회 성공
        return res.json(response(baseResponse.SUCCESS, result));

    } catch (err) {
        logger.error(`인기 피드 제공 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.06.30.
 * desc : 최신 피드 제공 API
 */
exports.new = async function (req, res) {
    // 페이지 유효성 검사
    let page = req.query.page;

    if (!page) page = 1;

    page = parseInt(page, 10);
    if (Number.isNaN(page) || page < 1) return res.json(errResponse(baseResponse.PAGE_WRONG));

    try {
        // 피드 제공 + 페이징
        let feeds;

        // 페이지에 따라서 피드 조회
        try {
            feeds = await feedDao.newFeedTest((page-1) * feedPerPage);
        } catch (err) {
            logger.error(`최신 피드 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 마지막 페이지인지
        let isLast = false;
        if (feeds.length < feedPerPage)
            isLast = true;

        const result = {
            feeds,
            isLast
        };

        // 최신 피드 조회 성공
        return res.json(response(baseResponse.SUCCESS, result));

    } catch (err) {
        logger.error(`최신 피드 제공 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

/**
 * update : 2021.07.16.
 * desc : 일반 숙소 업로드 API
 */
exports.uploadGeneralLodging = async function (req, res) {
    const {
        name, images, address, startDate, endDate, charge, correctionTool, correctionDegree,
        review, tags, pros, cons
    } = req.body;
    const userIndex = req.verifiedToken.userIndex;
    let generalLodgingIndex = 0;
    let feedIndex = 0;
    let type = 1;
    let lodgingIndex = 0;

    // 파라미터 있는지 확인
    if (!name || !images || !address || !startDate || !endDate || !charge || !correctionTool || !correctionDegree || !review) {
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));
    }

    // 날짜 유효한지 확인
    if (!date.isValidDate(startDate, endDate)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 가격 유효한지 확인
    let ch = parseInt(charge, 10);
    if (Number.isNaN(ch)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 보정정도 유효한지 확인
    let cd = parseInt(correctionDegree, 10);
    if (Number.isNaN(cd)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
    else if (cd < 0 || cd > 5) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 보정 도구 유효한지
    correctionTool.forEach(element => {
        if (element < 1 || element > 4) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
    });

    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        // 저장된 숙소인지 확인
        try {
            const isSavedGeneralLodgingRow = await feedDao.isSavedGeneralLodging(connection, name, address);
    
            if (isSavedGeneralLodgingRow.length == 0) {
                // 주소로 지역번호 추출
                const locationId = await location.getLocationIdByAddress(address);
                const newLodgingRows = await feedDao.createNewGeneralLodging(connection, name, locationId, address);
                generalLodgingIndex = newLodgingRows.insertId;
            } else {
                generalLodgingIndex = isSavedGeneralLodgingRow[0].generalLodgingIndex;
            }
            lodgingIndex = generalLodgingIndex;
        } catch (err) {
            logger.error(`API 8 - 숙소 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 피드 생성
        try {
            const newFeedRow = await feedDao.createNewFeed(connection, userIndex, 1, generalLodgingIndex, startDate, endDate, charge, correctionDegree, review);
            feedIndex = newFeedRow.insertId;
        } catch(err) {
            logger.error(`API 8 - 피드 생성 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 이미지 저장
        try {
            if (!(images == null || images == undefined)) {
                for (let i=0; i<images.length; i++) {
                    await feedDao.createFeedImage(connection, feedIndex, images[i], i+1);
                }
            }
        } catch(err) {
            logger.error(`API 8 - 이미지 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 태그 조회 및 추가
        try {
            if (!(tags == null || tags == undefined)) {
                for (let i=0; i<tags.length; i++) {
                    const isHashTagRow = await feedDao.isHashTag(connection, tags[i]);
                    let hashTagIndex = 0;
                    if (isHashTagRow.length == 0) {
                        // 없으면 새로 추가
                        const newHashTagRows = await feedDao.createHashTag(connection, tags[i]);
                        hashTagIndex = newHashTagRows.insertId;
                    } else {
                        hashTagIndex = isHashTagRow[0].hashTagIndex;
                    }
                    await feedDao.createFeedTag(connection, feedIndex, hashTagIndex);
                }
            }
        } catch(err) {
            logger.error(`API 8 - 태그 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 장점 추가
        try {
            if (!(pros == null || pros == undefined)) {
                for (let i=0; i<pros.length; i++) {
                    const isProsAndConsRow = await feedDao.isProsAndConsKeyword(connection, pros[i]);
                    let prosAndConsIndex = 0;
                    if (isProsAndConsRow.length == 0) {
                        // 없으면 새로 추가
                        const newProsAndConskeywordRow = await feedDao.createProsAndConsKeyword(connection, pros[i]);
                        prosAndConsIndex = newProsAndConskeywordRow.insertId;
                    } else {
                        prosAndConsIndex = isProsAndConsRow[0].lodgingProsAndConsIndex;
                    }
                    await feedDao.createFeedProsAndCons(connection, feedIndex, prosAndConsIndex, 'pros');
                }
            }
        } catch(err) {
            logger.error(`API 8 - 장점 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 단점 추가
        try {
            if (!(cons == null || cons == undefined)) {
                for (let i=0; i<cons.length; i++) {
                    const isProsAndConsRow = await feedDao.isProsAndConsKeyword(connection, cons[i]);
                    let prosAndConsIndex = 0;
                    if (isProsAndConsRow.length == 0) {
                        // 없으면 새로 추가
                        const newProsAndConskeywordRow = await feedDao.createProsAndConsKeyword(connection, cons[i]);
                        prosAndConsIndex = newProsAndConskeywordRow.insertId;
                    } else {
                        prosAndConsIndex = isProsAndConsRow[0].lodgingProsAndConsIndex;
                    }
                    await feedDao.createFeedProsAndCons(connection, feedIndex, prosAndConsIndex, 'cons');
                }
            }
        } catch(err) {
            logger.error(`API 8 - 장점 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 보정 도구 추가
        try {
            if (!(correctionTool == null || correctionTool == undefined)) {
                for (let i=0; i<correctionTool.length; i++) {
                    await feedDao.createFeedcorrectionTool(connection, feedIndex, correctionTool[i]);
                }
            }
        } catch(err) {
            logger.error(`API 8 - 보정 도구 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 성공
        await connection.commit();
        const result = {
            type,
            lodgingIndex
        };
        return res.json(response(baseResponse.SUCCESS, result));
    } catch(err) {
        logger.error(`API 8 Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    } finally {
        connection.release();
    }
}

/**
 * update : 2021.07.16.
 * desc :에어비앤비 업로드 API
 */
 exports.uploadAirbnb = async function (req, res) {
    const {
        locationId, images, description, url, startDate, endDate, charge, correctionTool, correctionDegree,
        review, tags, pros, cons
    } = req.body;
    const userIndex = req.verifiedToken.userIndex;
    let airbnbIndex = 0;
    let feedIndex = 0;
    const type = 2;
    let lodgingIndex = 0;

    // 파라미터 있는지 확인
    if (!locationId || !images || !description || !url || !startDate || !endDate || !charge || !correctionTool || !correctionDegree || !review) {
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));
    }

    // locationId 유효한지 확인
    let li = parseInt(locationId, 10);
    if (Number.isNaN(li)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
    else if (li < 1 || li > 172) res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 날짜 유효한지 확인
    if (!date.isValidDate(startDate, endDate)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 가격 유효한지 확인
    let ch = parseInt(charge, 10);
    if (Number.isNaN(ch)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 보정정도 유효한지 확인
    let cd = parseInt(correctionDegree, 10);
    if (Number.isNaN(cd)) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
    else if (cd < 0 || cd > 5) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    // 보정 도구 유효한지
    correctionTool.forEach(element => {
        if (element < 1 || element > 4) return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));
    });

    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        // 저장된 숙소인지 확인
        try {
            const isSavedAirbnbRow = await feedDao.isSavedAirbnb(connection, url);
    
            if (isSavedAirbnbRow.length == 0) {
                // 없으면 생성
                const newAirbnbRows = await feedDao.createAirbnb(connection, url, locationId);
                airbnbIndex = newAirbnbRows.insertId;
            } else {
                // 있으면 index 할당
                airbnbIndex = isSavedAirbnbRow[0].airbnbIndex;
            }
            lodgingIndex = airbnbIndex;
        } catch (err) {
            logger.error(`API 9 - 에어비앤비 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 피드 생성
        try {
            const newFeedRow = await feedDao.createNewFeedByAirbnb(connection, userIndex, 2, airbnbIndex, startDate, endDate, charge, correctionDegree, review, description);
            feedIndex = newFeedRow.insertId;
        } catch(err) {
            logger.error(`API 9 - 피드 생성 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 이미지 저장
        try {
            if (!(images == null || images == undefined)) {
                for (let i=0; i<images.length; i++) {
                    await feedDao.createFeedImage(connection, feedIndex, images[i], i+1);
                }
            }
        } catch(err) {
            logger.error(`API 9 - 이미지 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 태그 조회 및 추가
        try {
            if (!(tags == null || tags == undefined)) {
                for (let i=0; i<tags.length; i++) {
                    const isHashTagRow = await feedDao.isHashTag(connection, tags[i]);
                    let hashTagIndex = 0;
                    if (isHashTagRow.length == 0) {
                        // 없으면 새로 추가
                        const newHashTagRows = await feedDao.createHashTag(connection, tags[i]);
                        hashTagIndex = newHashTagRows.insertId;
                    } else {
                        hashTagIndex = isHashTagRow[0].hashTagIndex;
                    }
                    await feedDao.createFeedTag(connection, feedIndex, hashTagIndex);
                }
            }
        } catch(err) {
            logger.error(`API 9 - 태그 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 장점 추가
        try {
            if (!(pros == null || pros == undefined)) {
                for (let i=0; i<pros.length; i++) {
                    const isProsAndConsRow = await feedDao.isProsAndConsKeyword(connection, pros[i]);
                    let prosAndConsIndex = 0;
                    if (isProsAndConsRow.length == 0) {
                        // 없으면 새로 추가
                        const newProsAndConskeywordRow = await feedDao.createProsAndConsKeyword(connection, pros[i]);
                        prosAndConsIndex = newProsAndConskeywordRow.insertId;
                    } else {
                        prosAndConsIndex = isProsAndConsRow[0].lodgingProsAndConsIndex;
                    }
                    await feedDao.createFeedProsAndCons(connection, feedIndex, prosAndConsIndex, 'pros');
                }
            }
        } catch(err) {
            logger.error(`API 8 - 장점 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 단점 추가
        try {
            if (!(cons == null || cons == undefined)) {
                for (let i=0; i<cons.length; i++) {
                    const isProsAndConsRow = await feedDao.isProsAndConsKeyword(connection, cons[i]);
                    let prosAndConsIndex = 0;
                    if (isProsAndConsRow.length == 0) {
                        // 없으면 새로 추가
                        const newProsAndConskeywordRow = await feedDao.createProsAndConsKeyword(connection, cons[i]);
                        prosAndConsIndex = newProsAndConskeywordRow.insertId;
                    } else {
                        prosAndConsIndex = isProsAndConsRow[0].lodgingProsAndConsIndex;
                    }
                    await feedDao.createFeedProsAndCons(connection, feedIndex, prosAndConsIndex, 'cons');
                }
            }
        } catch(err) {
            logger.error(`API 9 - 장점 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 보정 도구 추가
        try {
            if (!(correctionTool == null || correctionTool == undefined)) {
                for (let i=0; i<correctionTool.length; i++) {
                    await feedDao.createFeedcorrectionTool(connection, feedIndex, correctionTool[i]);
                }
            }
        } catch(err) {
            logger.error(`API 9 - 보정 도구 추가 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 성공
        await connection.commit();
        const result = {
            type,
            lodgingIndex
        };
        return res.json(response(baseResponse.SUCCESS, result));
    } catch(err) {
        logger.error(`API 9 Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    } finally {
        connection.release();
    }
}


/**
 * update : 2021.07.25.
 * desc : 찜하기/해제
 */
 exports.saveFeed = async function (req, res) {
    const userIndex = req.verifiedToken.userIndex;
    let { savedListIndex, feedIndex } = req.body;
    savedListIndex = parseInt(savedListIndex, 10);
    feedIndex = parseInt(feedIndex, 10);


    // validation
    if (!savedListIndex || !feedIndex)
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));
    
    if (Number.isNaN(savedListIndex) || Number.isNaN(feedIndex))
        return res.json(errResponse(baseResponse.UPLOAD_PARAMETER_INVALID));

    try {
        try {
            const isExistSavedList = await feedDao.isExistSavedList(savedListIndex, userIndex);
            if (isExistSavedList.length == 0)
                return res.json(errResponse(baseResponse.SL_PARAMETER_INVALID));

            const isExistFeed = await feedDao.isExistFeed(feedIndex);
            if (isExistFeed.length == 0)
                return res.json(errResponse(baseResponse.FEED_EMPTY));
        } catch {
            logger.error(`API 15 - 목록 조회 DB Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        try {
            const feedInList = await feedDao.isExistFeedInSavedList(savedListIndex, feedIndex);
            
            if (feedInList == 0) {
                // 없으면 찜
                await feedDao.createNewSavedFeed(savedListIndex, feedIndex);
                return res.json(response(baseResponse.SUCCESS));
            } else {
                // 있는 경우에
                // normal 이면 찜 해제, unsave 면 찜하기
                if (feedInList[0].status == 'normal') {
                    await feedDao.updateSavedFeed(feedInList[0].savedFeedIndex, 'unsave');
                    return res.json(response(baseResponse.UNDO_SAVED_SUCCESS));
                } else {
                    await feedDao.updateSavedFeed(feedInList[0].savedFeedIndex, 'normal');
                    return res.json(response(baseResponse.SUCCESS));
                }    
            }
        } catch(err) {
            logger.error(`API 15 - 찜하기/해제 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
    } catch(err) {
        logger.error(`API 15 Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
}