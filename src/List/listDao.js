const { pool } = require("../../config/database");

/**
 * update : 2021.06.29.
 * desc : [Dummy] 홈 화면 제공
 */
async function getSavedList(userIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT savedListIndex, title FROM SavedList WHERE userIndex = ?;
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
    WHERE sf.savedListIndex = ? AND fi.uploadOrder = 1;
    `;
    const Params = [savedListIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
  
    return rows;
}


module.exports = {
    getSavedList,
    getSourceAtSavedList,
};