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
    const proscons = await feedViewDao.selectProsAndCons(connection, feedIndex);
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

    if (proscons["keyword"]) {
      proscons["keyword"] = proscons["keyword"].split(",");
    }

    let hashTags = [];
    
    if (feedInfo["hashTags"]) {
      for(var i = 0; i<feedInfo["hashTags"].length; i++) {
        hashTags.push({ "hashTags":feedInfo["hashTags"][i]} );
      }
      
    }
  
    delete feedInfo.hashTags;

    let prosAndCons;
    if (proscons[0] && proscons[1]) {
      prosAndCons = { "cons": proscons[0]["keyword"], "pros": proscons[1]["keyword"]};
    }
    else if(proscons[0] && proscons[0]["status"] == "pros") {
      prosAndCons = { "pros": proscons[0]["keyword"]};
    }
    else {
      prosAndCons = { "cons": proscons[0]["keyword"]};
    }

    connection.release();


    const  result = {
      feedImage,
      feedLike,
      correction,
      save,
      prosAndCons,
      feedInfo,
      hashTags,
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

  exports.retrieveSearch = async function (pros, cons, locationIdx, minPrice, maxPrice, interval) {

    const connection = await pool.getConnection(async (conn) => conn);


    const params = [pros, cons, locationIdx, locationIdx, minPrice, maxPrice];
    const paramsProsAll = [cons, locationIdx, locationIdx, minPrice, maxPrice];

    let feed;

    if (pros.length == 0) {
      if (interval == "year") {
        feed = await feedViewDao.searchFeedProsAllYear(connection, paramsProsAll);
      }
      else if (interval == "month") {
        feed = await feedViewDao.searchFeedProsAllMonth(connection, paramsProsAll);
      }
      else if (interval == "week") {
        feed = await feedViewDao.searchFeedProsAllWeek(connection, paramsProsAll);
      }
      else if (interval == "day") {
        feed = await feedViewDao.searchFeedProsAllDay(connection, paramsProsAll);
      }
      else if (interval == "hour") {
        feed = await feedViewDao.searchFeedProsAllHour(connection, paramsProsAll);
      }
      
    }
    else {
      if (interval == "year") {
        feed = await feedViewDao.searchFeedYear(connection, params);
      }
      else if (interval == "month") {
        feed = await feedViewDao.searchFeedMonth(connection, params);
      }
      else if (interval == "week") {
        feed = await feedViewDao.searchFeedWeek(connection, params);
      }
      else if (interval == "day") {
        feed = await feedViewDao.searchFeedDay(connection, params);
      }
      else if (interval == "hour") {
        feed = await feedViewDao.searchFeedHour(connection, params);
      }
    } 
    
    connection.release();

    return feed;

  }

  exports.feedLike = async function(userIndex, feedIndex) {
    const connection = await pool.getConnection(async (conn) => conn);

    const param = [userIndex, feedIndex];

    const selectLike = await feedViewDao.selectFeedLike(connection, param);

    let likeResult;
    if (selectLike.length == 0) {
      likeResult = await feedViewDao.insertFeedLike(connection, param);
      console.log('insert');
    } else {
      likeResult = await feedViewDao.updateFeedLike(connection, param);
      console.log('update')
    }

    connection.release();

    return likeResult;
    
  }

  exports.feedDislike = async function(userIndex, feedIndex) {
    const connection = await pool.getConnection(async (conn) => conn);

    const param = [userIndex, feedIndex];
    
    const unlikeResult = await feedViewDao.updateFeedDislike(connection, param);

    connection.release();

    return unlikeResult;
  }