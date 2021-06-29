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

/**
 * update : 2021.06.30.
 * desc : [Dummy] 인기 피드 제공 - 인기해시태그
 */
 async function hotFeedHotHashTagTest() {
  const connection = await pool.getConnection(async (conn) => conn);
  const Query = `
  SELECT DISTINCT ht.keyword, lodging.source
  FROM HashTag ht
  JOIN FeedTag ft ON ht.hashTagIndex = ft.hashTagIndex
  JOIN (SELECT f.feedIndex, source
  FROM Feed f
  JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
  UNION
  SELECT f.feedIndex, source
  FROM Feed f
  JOIN Airbnb a ON f.lodgingIndex = a.airbnbIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  WHERE f.lodgingType = 2 AND fi.uploadOrder = 1) as lodging ON ft.feedIndex = lodging.feedIndex
  GROUP BY ht.keyword
  LIMIT 5;
  `;

  const [rows] = await connection.query(Query)
  connection.release();

  return rows;
}

/**
 * update : 2021.06.30.
 * desc : [Dummy] 인기 피드 제공
 */
 async function hotFeedTest(offset) {
  const connection = await pool.getConnection(async (conn) => conn);
  const Query = `
  SELECT f.feedIndex, source, gl.name as name,
    FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as reliability,
    f.correctionDegree as degree
  FROM Feed f
  JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex
  UNION
  SELECT f.feedIndex, source, (SELECT '서울 에어비엔비') as name,
    FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as reliability,
    f.correctionDegree as degree
  FROM Feed f
  JOIN Airbnb a ON f.lodgingIndex = a.airbnbIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 2 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex
  LIMIT 24 OFFSET ${offset};
  `;

  const [rows] = await connection.query(Query)
  connection.release();

  return rows;
}

/**
 * update : 2021.06.30.
 * desc : [Dummy] 최신 피드 제공
 */
 async function newFeedTest(offset) {
  const connection = await pool.getConnection(async (conn) => conn);
  const Query = `
  SELECT lodging.feedIndex, lodging.source, lodging.name, lodging.reliability, lodging.degree
  FROM ((SELECT f.feedIndex, source, gl.name as name,
        FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as reliability,
        f.correctionDegree as degree, f.createdAt
  FROM Feed f
  JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex)
  UNION
  (SELECT f.feedIndex, source, (SELECT '서울 에어비엔비') as name,
        FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as reliability,
        f.correctionDegree as degree, f.createdAt
  FROM Feed f
  JOIN Airbnb a ON f.lodgingIndex = a.airbnbIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 2 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex)) as lodging
  ORDER BY lodging.createdAt DESC
  LIMIT 24 OFFSET ${offset};
  `;

  const [rows] = await connection.query(Query)
  connection.release();

  return rows;
}

module.exports = {
    homeTestDao,
    homeTestWithTagDao,
    hotFeedHotHashTagTest,
    hotFeedTest,
    newFeedTest,
};