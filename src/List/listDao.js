const { pool } = require("../../config/database");

/**
 * update : 2021.07.17.
 * desc : 찜 목록 조회
 */
async function getSavedList(userIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT savedListIndex, title FROM SavedList WHERE userIndex = ? AND status = 'normal' AND status = 'normal';
    `;
    const Params = [userIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
  
    return rows;
}
async function getSourceAtSavedList(savedListIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT fi.source
    FROM SavedFeed sf
    JOIN FeedImage fi ON sf.feedIndex = fi.feedIndex
    WHERE sf.savedListIndex = ? AND fi.uploadOrder = 1 AND sf.status = 'normal'
    LIMIT 4;
    `;
    const Params = [savedListIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
  
    return rows;
}

/**
 * update : 2021.07.17.
 * desc : 찜 목록 생성
 */
 async function createSavedList(userIndex, title) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    INSERT INTO SavedList(userIndex, title) VALUES (?, ?);
    `;
    const Params = [userIndex, title];
    const [rows] = await connection.query(Query, Params);
    connection.release();
    return rows;
}

/**
 * update : 2021.07.17.
 * desc : 찜 목록 수정
 */
 async function updateSavedList(conn, savedListIndex, title, userIndex) {
    const connection = conn;
    const Query = `
    UPDATE SavedList SET title = ? WHERE savedListIndex = ? AND userIndex = ? AND status = 'normal';
    `;
    const Params = [title, savedListIndex, userIndex];
    const [rows] = await connection.query(Query, Params);
    return rows;
}

/**
 * update : 2021.07.17.
 * desc : 찜 목록 삭제
 */
 async function deleteSavedList(savedListIndex, userIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    UPDATE SavedList SET status = 'deleted' WHERE savedListIndex = ? AND userIndex = ? AND status = 'normal';
    `;
    const Params = [savedListIndex, userIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();

    return rows;
}

/**
 * update : 2021.07.19.
 * desc : 특정 찜 목록 조회 - title
 */
 async function getTitleOfSavedList(userIndex, savedListIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT title FROM SavedList WHERE userIndex = ? AND status = 'normal' AND savedListIndex = ?;
    `;
    const Params = [userIndex, savedListIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
  
    return rows;
}
/**
 * update : 2021.07.19.
 * desc : 특정 찜 목록 조회 - feeds
 */
 async function getFeedsOfSavedList(savedListIndex, offset) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT sf.feedIndex, fi.source
    FROM SavedFeed sf
    JOIN FeedImage fi ON sf.feedIndex = fi.feedIndex
    WHERE sf.savedListIndex = ? AND fi.uploadOrder = 1 AND sf.status = 'normal'
    ORDER BY sf.createdAt DESC
    LIMIT 24 OFFSET ${offset};
    `;
    const Params = [savedListIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
  
    return rows;
}

module.exports = {
    getSavedList,
    getSourceAtSavedList,
    createSavedList,
    updateSavedList,
    deleteSavedList,
    getTitleOfSavedList,
    getFeedsOfSavedList,
};