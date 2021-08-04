
// email로 회원 조회
async function selectUserEmail(connection, email) {
  const selectUserIdQuery = `
                 SELECT userIndex, email
                 FROM User 
                 WHERE email = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, email);
  return userRow;
}

async function selectUserId(connection, userIndex) {
  const selectUserIdQuery = `
                 SELECT *
                 FROM User 
                 WHERE userIndex = ?;
                 `;
  const [userRow] = await connection.query(selectUserIdQuery, userIndex);
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

async function selectUserApple(connection, appleId) {
  const selectAppleQuery = `
                  SELECT userIndex, email, nickname
                  FROM User
                  WHERE appleId = ?;
  `;
  const [appleRow] = await connection.query(selectAppleQuery, appleId);
  return appleRow;
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

// 애플 연동 회원 가입
async function insertUserInfoByApple(connection, insertUserInfoParams) {
  const insertUserInfoQuery = `
        INSERT INTO User(nickname, appleId, email)
        VALUES (?, ?, ?);
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

async function updateUserProfile(connection, params) {
  const updateUserProfileUrlQuery = `
    UPDATE User SET avatarUrl = ? WHERE userIndex = ?;
  `;
  const updateUserNicknameRow = await connection.query(
    updateUserProfileUrlQuery,
    params
  );
  return updateUserNicknameRow
}

async function deleteUser1(connection, userIndex) {
  const deleteUserQuery = `
    DELETE FROM User WHERE userIndex = ?;
  `;
  const deleteUserRow = await connection.query(
    deleteUserQuery,
    userIndex
  );
  return deleteUserRow
}

async function deleteUser2(connection, userIndex) {
  const deleteUserQuery = `
    DELETE FROM SavedList WHERE userIndex = ?;
  `;
  const deleteUserRow = await connection.query(
    deleteUserQuery,
    userIndex
  );
  return deleteUserRow
}

async function deleteUser3(connection, userIndex) {
  const deleteUserQuery = `
    DELETE FROM Reliability WHERE userIndex = ?;
  `;
  const deleteUserRow = await connection.query(
    deleteUserQuery,
    userIndex
  );
  return deleteUserRow
}

async function deleteUser4(connection, userIndex) {
  const deleteUserQuery = `
    DELETE FROM Feed WHERE userIndex = ?;
  `;
  const deleteUserRow = await connection.query(
    deleteUserQuery,
    userIndex
  );
  return deleteUserRow
}

async function selectUserStatus1(connection, email) {
  const selectUserIdQuery = `
    SELECT status
    FROM User
    WHERE email = ?;
                 `;
  const [statusRow] = await connection.query(selectUserIdQuery, email);
  return statusRow;
}

async function selectUserStatus2(connection, appleId) {
  const selectAppleQuery = `
    SELECT status
    FROM User
    WHERE appleId = ?;
  `;
  const [statusRow] = await connection.query(selectAppleQuery, appleId);
  return statusRow;
}

// ---------------------------------------------

module.exports = {
  selectUserEmail,
  selectUserNickname,
  insertUserInfo,
  insertUserInfoByApple,
  updateUserNickname,
  selectUserApple,
  updateUserProfile,
  deleteUser1,
  deleteUser2,
  deleteUser3,
  deleteUser4,
  selectUserId,
  selectUserStatus1,
  selectUserStatus2,
};
