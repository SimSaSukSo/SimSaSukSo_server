const { pool } = require("../../config/database");

exports.isValidLodging = async function (type, lodging) {
    const connection = await pool.getConnection(async (conn) => conn);
    let Query;
    if (type == 1) {
        Query = `
        SELECT generalLodgingIndex FROM GeneralLodging WHERE generalLodgingIndex = ?;
        `;
    } else {
        Query = `
        SELECT airbnbIndex FROM Airbnb WHERE airbnbIndex = ?
        `;
    }
    const Params = [lodging];
    const [rows] = await connection.query(Query, Params);
    connection.release();
    return rows;
}

exports.getFeedListToFeedback = async function (type, lodging, userIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT f.feedIndex, u.nickname, u.avatarUrl
    FROM Feed f
    JOIN User u ON f.userIndex = u.userIndex
    WHERE f.feedIndex NOT IN (
        SELECT r.feedIndex FROM Reliability r WHERE r.userIndex = ?
    ) AND f.lodgingType = ? AND f.lodgingIndex = ? AND f.userIndex != ?
    LIMIT 10;
    `;
    const Params = [userIndex, type, lodging, userIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
    return rows;
}

exports.getImageByFeedIndex = async function (feedIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT source FROM FeedImage WHERE feedIndex = ? ORDER BY uploadOrder;
    `;
    const Params = [feedIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
    return rows;
}

exports.isExistFeed = async function (feedIndex) {
    const connection = await pool.getConnection(async (conn) => conn);
    const Query = `
    SELECT feedIndex FROM Feed WHERE feedIndex = ?
    `;
    const Params = [feedIndex];
    const [rows] = await connection.query(Query, Params);
    connection.release();
    return rows;
}

exports.createFeedback = async function (conn, userIndex, feedIndex, degree) {
    const connection = conn;
    const Query = `
    INSERT INTO Reliability(userIndex, feedIndex, degree) VALUES (?, ?, ?);
    `;
    const Params = [userIndex, feedIndex, degree];
    const [rows] = await connection.query(Query, Params);
    return rows;
}