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
    
    if (correction["correctionToolIndex"]) {
      correction["correctionToolIndex"] = correction["correctionToolIndex"].split(",");
 
      correction["correctionToolIndex"] = correction["correctionToolIndex"].map( item => parseInt(item));
  
      correction["correctionTool"] = correction["correctionTool"].split(",");
    }

    if (feedInfo["reliability"]) {

      feedInfo["reliability"] = parseInt(feedInfo["reliability"]);

    }

    if (feedInfo["hashTags"]) {
      feedInfo["hashTags"] = feedInfo["hashTags"].split(",");
    }

    if (feedInfo["startDate"]) {
      feedInfo["startDate"] = feedInfo["startDate"].toISOString().substring(0, 10);
    }

    if (feedInfo["endDate"]) {
      feedInfo["endDate"] = feedInfo["endDate"].toISOString().substring(0, 10);
    }

    if (feedInfo["createdAt"]) {
      feedInfo["createdAt"] = feedInfo["createdAt"].toISOString().substring(0, 10);
    }

    if (prosAndCons["keyword"]) {
      prosAndCons["keyword"] = prosAndCons["keyword"].split(",");
    }
    
    
  
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

  exports.retriveFeedComment = async function (userIndex, feedIndex) {

    const connection = await pool.getConnection(async (conn) => conn);

    const feedParams = [feedIndex, feedIndex];

    const feedComment = await feedViewDao.selectFeedComment(connection, feedParams);

    connection.release();

    return feedComment;
  }