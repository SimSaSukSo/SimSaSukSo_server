
// email로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserIdQuery = `
                 SELECT email
                 FROM User 
                 WHERE email = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, email);
  return userRow;
}

// 카카오 연동 회원 가입
async function insertUserInfo(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(nickname, kakaoId, avatarUrl, email)
        VALUES (?, ?, ?, ?);
    `;
  const insertUserInfoRow = await connection.query(
    insertUserInfoQuery,
    insertUserInfoParams
  );

  return insertUserInfoRow;
}

// ---------------------------------------------

module.exports = {
  selectUserEmail,
  insertUserInfo,
};
