const {pool} = require('../../config/database');
const {logger} = require('../../config/winston');
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");

const feedDao = require('./feedDao');

const feedPerPage = 24;

/**
 * update : 2021.06.29.
 * desc : 홈 화면 제공 API
 */
exports.index = async function (req, res) {
    // 클라이언트에게 지역명 입력 받음
    const region = req.query.region;

    /**
     * Todo (when 210629)
     * 1. 지역명 협의 - 지역명을 입력받을지, 지역아이디를 입력받을지
     * 2. '서울'을 입력한다고 가정하고 더미데이터 전송
     * 3. 지역을 어떻게 받을지에 따라 이후 코드 수정 필요
     */
    // 유효성 검사
    if (!region) return res.json(errResponse(baseResponse.REGION_EMPTY));
    if (region !== '서울') return res.json(errResponse(baseResponse.REGION_WRONG));

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
            hotPlaces = await feedDao.homeTestDao(region);
        } catch (err) {
            logger.error(`요즘 대세 호텔 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 지역 TOP 5 조회
        try {
            regionPlaces = await feedDao.homeTestDao(region);
        } catch (err) {
            logger.error(`지역 TOP 5 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 급상승 숙소 조회
        try {
            trendPlaces = await feedDao.homeTestDao(region);
        } catch (err) {
            logger.error(`급상승 숙소 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 좋아요가 많은 게시글 조회
        try {
            likePlaces = await feedDao.homeTestDao(region);
        } catch (err) {
            logger.error(`좋아요가 많은 게시글 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        // 신뢰도가 높은 게시글 조회
        try {
            believePlaces = await feedDao.homeTestWithTagDao(region);
        } catch (err) {
            logger.error(`신뢰도가 높은 게시글 조회 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        // 반환 형태 정의
        const result = {
            hotPlaces,
            regionName: region,
            regionPlaces,
            trendPlaces,
            likePlaces,
            believePlaces
        };

        // 홈 화면 조회 성공
        return res.send(response(baseResponse.SUCCESS, result));

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
    if (Number.isNaN(page)) return res.json(errResponse(baseResponse.PAGE_WRONG));

    try {
        // 인기 해시태그, 피드 제공 + 페이징
        let hashTags;
        let feeds;

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

        const result = {
            hashTags,
            feeds
        };

        // 인기 피드 조회 성공
        return res.send(response(baseResponse.SUCCESS, result));

    } catch (err) {
        logger.error(`인기 피드 제공 API Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.SERVER_ERROR));
    }
};

exports.new = async function (req, res) {
    
};