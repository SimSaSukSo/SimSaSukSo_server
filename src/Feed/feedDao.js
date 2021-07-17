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
  LIMIT 10;
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
    CAST(FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as unsigned) as reliability,
    f.correctionDegree as degree
  FROM Feed f
  JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex
  UNION
  SELECT f.feedIndex, source, (SELECT '서울 에어비엔비') as name,
    CAST(FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as unsigned) as reliability,
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
        CAST(FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as unsigned) as reliability,
        f.correctionDegree as degree, f.createdAt
  FROM Feed f
  JOIN GeneralLodging gl ON f.lodgingIndex = gl.generalLodgingIndex
  JOIN FeedImage fi ON f.feedIndex = fi.feedIndex
  LEFT JOIN Reliability r ON f.feedIndex = r.feedIndex
  WHERE f.lodgingType = 1 AND fi.uploadOrder = 1
  GROUP BY f.feedIndex)
  UNION
  (SELECT f.feedIndex, source, (SELECT '서울 에어비엔비') as name,
        CAST(FORMAT(IF (AVG(r.degree), AVG(r.degree)*20, 0), 0) as unsigned) as reliability,
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

/**
 * update : 2021.07.17.
 * desc : API 8 - 저장된 숙소 유무 확인
 */
 async function isSavedGeneralLodging(conn, name, address) {
  const connection = conn;
  const Query = `
  SELECT generalLodgingIndex
  FROM GeneralLodging
  WHERE name = ? AND address = ? ;
  `;

  const Params = [name, address];
  const [rows] = await connection.query(Query, Params);
  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 새로운 일반 숙소 추가
 */
 async function createNewGeneralLodging(conn, name, locationId, address) {
  const connection = conn;
  const Query = `
  INSERT INTO GeneralLodging(name, locationIndex, address)
  VALUES (?, ?, ?);
  `;
  const Params = [name, locationId, address];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 새로운 일반 숙소 피드 추가
 */
 async function createNewFeed(conn, userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review) {
  const connection = conn;
  const Query = `
  INSERT INTO Feed(userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const Params = [userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 이미지 추가
 */
 async function createFeedImage(conn, feedIndex, source, uploadOrder) {
  const connection = conn;
  const Query = `
  INSERT INTO FeedImage(feedIndex, source, uploadOrder)
  VALUES (?, ?, ?);
  `;
  const Params = [feedIndex, source, uploadOrder];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 태그 조회
 */
 async function isHashTag(conn, keyword) {
  const connection = conn;
  const Query = `
  SELECT hashTagIndex FROM HashTag WHERE keyword = ? AND status = 'normal';
  `;
  const Params = [keyword];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 해시 태그 추가
 */
 async function createHashTag(conn, keyword) {
  const connection = conn;
  const Query = `
  INSERT INTO HashTag(keyword) VALUES (?);
  `;
  const Params = [keyword];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 피드 태그 추가
 */
 async function createFeedTag(conn, feedIndex, hashTagIndex) {
  const connection = conn;
  const Query = `
  INSERT INTO FeedTag(feedIndex, hashTagIndex) VALUES (?, ?);
  `;
  const Params = [feedIndex, hashTagIndex];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 장단점 키워드 조회
 */
 async function isProsAndConsKeyword(conn, keyword) {
  const connection = conn;
  const Query = `
  SELECT lodgingProsAndConsIndex FROM LodgingProsAndCons WHERE keyword = ? AND status = 'normal';
  `;
  const Params = [keyword];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 장단점 키워드 추가
 */
 async function createProsAndConsKeyword(conn, keyword) {
  const connection = conn;
  const Query = `
  INSERT INTO LodgingProsAndCons(keyword) VALUES (?);
  `;
  const Params = [keyword];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 8 - 피드 장단점 추가
 */
 async function createFeedProsAndCons(conn, feedIndex, lodgingProsAndConsIndex, status) {
  const connection = conn;
  const Query = `
  INSERT INTO FeedProsAndCons(feedIndex, lodgingProsAndConsIndex, status) VALUES (?, ?, ?);
  `;
  const Params = [feedIndex, lodgingProsAndConsIndex, status];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 9 - 저장된 에어비앤비 확인
 */
 async function isSavedAirbnb(conn, url) {
  const connection = conn;
  const Query = `
  SELECT airbnbIndex FROM Airbnb WHERE url = ?;
  `;

  const Params = [url];
  const [rows] = await connection.query(Query, Params);
  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 9 - 에어비앤비 추가
 */
 async function createAirbnb(conn, url, locationIndex) {
  const connection = conn;
  const Query = `
  INSERT INTO Airbnb(url, locationIndex) VALUES (?, ?);
  `;

  const Params = [url, locationIndex];
  const [rows] = await connection.query(Query, Params);
  return rows;
}

/**
 * update : 2021.07.17.
 * desc : API 0 - 새로운 에어비앤비 피드 추가
 */
 async function createNewFeedByAirbnb(conn, userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review, airbnbDesc) {
  const connection = conn;
  const Query = `
  INSERT INTO Feed(userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review, airbnbDesc)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const Params = [userIndex, lodgingType, lodgingIndex, startDate, endDate, charge, correctionDegree, review, airbnbDesc];
  const [rows] = await connection.query(Query, Params);

  return rows;
}

module.exports = {
    homeTestDao,
    homeTestWithTagDao,
    hotFeedHotHashTagTest,
    hotFeedTest,
    newFeedTest,
    isSavedGeneralLodging,
    createNewGeneralLodging,
    createNewFeed,
    createFeedImage,
    isHashTag,
    createHashTag,
    createFeedTag,
    isProsAndConsKeyword,
    createProsAndConsKeyword,
    createFeedProsAndCons,
    isSavedAirbnb,
    createAirbnb,
    createNewFeedByAirbnb,
};