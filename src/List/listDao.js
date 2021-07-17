const { pool } = require("../../config/database");

/**
 * update : 2021.07.17.
 * desc : 찜 목록 조회
 */
async function getSavedList(userIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT savedListIndex, title FROM SavedList WHERE userIndex = ? AND status = 'normal';
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
    WHERE sf.savedListIndex = ? AND fi.uploadOrder = 1 LIMIT 4;
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


module.exports = {
    getSavedList,
    getSourceAtSavedList,
    createSavedList,
};