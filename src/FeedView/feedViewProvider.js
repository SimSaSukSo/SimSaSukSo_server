const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");

const feedViewDao = require("./feedViewDao");

// Provider: Read 비즈니스 로직 처리

exports.retriveFeedInfo = async function (userIndex, feedIndex) {
    const connection = await pool.getConnection(async (conn) => conn);

    const fufParams = [feedIndex, userIndex, feedIndex];
    const feedParams = [feedIndex, feedIndex];
    const fuParams = [feedIndex, userIndex];
    
    const feedImage = await feedViewDao.selectImageList(connection, feedIndex);
    const [feedLike] = await feedViewDao.selectLike(connection, fufParams);
    const [correction] = await feedViewDao.selectCorrection(connection, feedParams);
    const [save] = await feedViewDao.selectSave(connection, fuParams);
    const prosAndCons = await feedViewDao.selectProsAndCons(connection, feedIndex);
    const [feedInfo] = await feedViewDao.selectFeedInfo(connection, feedParams);
    const [lodgingInfo] = await feedViewDao.selectLodgingInfo(connection, feedParams);
  
    connection.release();


    const  result = {
      feedImage,
      feedLike,
      correction,
      save,
      prosAndCons,
      feedInfo,
      lodgingInfo
    }
  
    return result;
  };