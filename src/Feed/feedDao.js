const { pool } = require("../../config/database");

/**
 * update : 2021.06.29.
 * desc : [Dummy] 홈 화면 제공
 */
async function homeTestDao(region) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT f.feedIndex, source, gl.name as name
    FROM Feed f
    JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
    JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
    WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
    UNION
    SELECT f.feedIndex, source, (SELECT '${region} 에어비엔비') as name
    FROM Feed f
    JOIN Airbnb a ON f.lodgingIndex = a.airbnbIndex
    JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
    WHERE f.lodgingType = 2 AND fi.uploadOrder = 1
    LIMIT 5;
    `;
  
    const [rows] = await connection.query(Query)
    connection.release();
  
    return rows;
}

/**
 * update : 2021.06.29.
 * desc : [Dummy] 홈 화면 - 신뢰도 높은 게시글 
 */
 async function homeTestWithTagDao() {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT lodging.feedIndex, lodging.source, lodging.name, GROUP_CONCAT(ht.keyword SEPARATOR ',') as tags
    FROM (SELECT f.feedIndex, source, gl.name as name
    FROM Feed f
    JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
    JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
    WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
    UNION
    SELECT f.feedIndex, source, (SELECT '서울 에어비엔비') as name
    FROM Feed f
    JOIN Airbnb a ON f.lodgingIndex = a.airbnbIndex
    JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
    WHERE f.lodgingType = 2 AND fi.uploadOrder = 1) as lodging
    JOIN FeedTag ft ON lodging.feedIndex = ft.feedIndex
    JOIN HashTag ht ON ft.hashTagIndex = ht.hashTagIndex
    GROUP BY lodging.feedIndex
    LIMIT 3;
    `;
  
    const [rows] = await connection.query(Query)
    connection.release();
  
    return rows;
  }

module.exports = {
    homeTestDao,
    homeTestWithTagDao,
};