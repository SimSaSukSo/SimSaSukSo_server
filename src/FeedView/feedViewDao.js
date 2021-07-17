
async function selectImageList(connection, feedIndex) {
const selectImageQuery = `
    SELECT FeedImage.feedImageIndex,
        FeedImage.source,
        FeedImage.uploadOrder
    FROM Feed, FeedImage
    WHERE Feed.feedIndex = ? and
    FeedImage.feedIndex = Feed.feedIndex;
                `;
const [imageRow] = await connection.query(selectImageQuery, feedIndex);
return imageRow;
}

async function selectLike(connection, requestParams) {
const selectLikeQuery = `
    SELECT count(*) as likeNum,
        isLike.isLiked
    FROM FeedLike
    INNER JOIN (SELECT IFNULL(count(*), 0) as isLiked
                    FROM FeedLike
                    WHERE FeedLike.feedIndex = ? and
                        FeedLike.userIndex = ?) isLike
    WHERE FeedLike.feedIndex = ?;
            `;
const [feedLikeRow] = await connection.query(selectLikeQuery, requestParams);
return feedLikeRow;
}

async function selectCorrection(connection, feedParams) {
const selectCorrectionQuery = `
    SELECT group_concat(FeedTool.correctionToolIndex) as correctionToolIndex,
            group_concat(CorrectionTool.name) as correctionTool,
            Feed.correctionDegree
    FROM FeedTool, CorrectionTool
    INNER JOIN (
    SELECT Feed.correctionDegree
    FROM Feed
    WHERE Feed.feedIndex = ? ) Feed
    WHERE FeedTool.feedIndex = ? and
    CorrectionTool.correctionToolIndex = FeedTool.correctionToolIndex;
            `;
    const [feedCorrectionRow] = await connection.query(selectCorrectionQuery, feedParams);
    return feedCorrectionRow;
}

async function selectSave(connection, fuParams) {
    const selectSaveQuery = `
    SELECT IFNULL(count(*), 0) as isSaved,
        SaveFeed.saveNum
    FROM SavedList
    INNER JOIN(
    SELECT savedListIndex,
        count(*) as saveNum
    FROM SavedFeed
    WHERE SavedFeed.feedIndex = ?) SaveFeed
    WHERE SaveFeed.savedListIndex = SavedList.savedListIndex and userIndex = ?;
                `;
    const [feedSaveRow] = await connection.query(selectSaveQuery, fuParams);
    return feedSaveRow;
}

async function selectProsAndCons(connection, feedIndex) {
    const selectProsAndConsQuery = `
    SELECT FeedProsAndCons.status,
        LodgingProsAndCons.keyword
    FROM FeedProsAndCons, LodgingProsAndCons
    WHERE FeedProsAndCons.feedIndex = ? and
        FeedProsAndCons.lodgingProsAndConsIndex = LodgingProsAndCons.lodgingProsAndConsIndex;
                `;
    const [prosAndConsRow] = await connection.query(selectProsAndConsQuery, feedIndex);
    return prosAndConsRow;
}

async function selectFeedInfo(connection, feedParams) {
    const selectFeedInfoQuery = `
    SELECT Feed.review,
            Feed.charge,
            Feed.startDate,
            Feed.endDate,
            Feed.createdAt,
            sum(Reliability.degree) / count(*) as reliability,
            HashTags.hashTags
    FROM Feed, Reliability
    INNER JOIN(
    SELECT group_concat(HashTag.keyword) as hashTags
    FROM FeedTag, HashTag
    WHERE feedIndex = ? and
    FeedTag.hashTagIndex = HashTag.hashTagIndex ) HashTags
    WHERE Feed.feedIndex = ? and
        Reliability.feedIndex = Feed.feedIndex;
                `;
    const [feedInfoRow] = await connection.query(selectFeedInfoQuery, feedParams);
    return feedInfoRow;
}

async function selectLodgingInfo(connection, feedParams) {
    const selectLodgingInfoQuery = `
    SELECT Airbnb.airbnbIndex,
                Airbnb.url,
                FeedLodging.airbnbDesc as description
        FROM Airbnb
        INNER JOIN(
            SELECT Feed.lodgingType,
                Feed.lodgingIndex,
                Feed.airbnbDesc
            FROM  Feed
            WHERE Feed.feedIndex = ?
            ) FeedLodging
        WHERE FeedLodging.lodgingType = 2 and
            FeedLodging.lodgingIndex = Airbnb.airbnbIndex
    UNION ALL
    SELECT GeneralLodging.generalLodgingIndex,
            GeneralLodging.name,
            GeneralLodging.address
    FROM GeneralLodging
    INNER JOIN(
        SELECT Feed.lodgingType,
            Feed.lodgingIndex,
            Feed.airbnbDesc
        FROM  Feed
        WHERE Feed.feedIndex = ?
        ) FeedLodging
    WHERE FeedLodging.lodgingType = 1 and
        FeedLodging.lodgingIndex = GeneralLodging.generalLodgingIndex;
                `;
    const [lodgingInfoRow] = await connection.query(selectLodgingInfoQuery, feedParams);
    return lodgingInfoRow;
}

module.exports = {
    selectImageList,
    selectLike,
    selectCorrection,
    selectSave,
    selectProsAndCons,
    selectFeedInfo,
    selectLodgingInfo,
};
  