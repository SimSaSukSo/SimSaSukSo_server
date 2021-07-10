
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

async function selectUserNickname(connection, nickname) {
  const selectNicknameQuery = `
                  SELECT nickname
                  FROM User
                  WHERE nickname = ?;
  `;
  const [nicknameRow] = await connection.query(selectNicknameQuery, nickname);
  return nicknameRow;
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

// 닉네임 설정
async function updateUserNickname(connection, insertUserInfoParams) {
  const updateUserNicknameQuery = `
        UPDATE User
        SET nickname = ?
        WHERE kakaoId = ?;
  `;
  const updateUserNicknameRow = await connection.query(
    updateUserNicknameQuery,
    insertUserInfoParams
  );
  return updateUserNicknameRow
}

// ---------------------------------------------

module.exports = {
  selectUserEmail,
  selectUserNickname,
  insertUserInfo,
  updateUserNickname,
};