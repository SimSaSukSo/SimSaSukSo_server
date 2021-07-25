
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
           iFNULL(SaveFeed.saveNum, 0) as saveNum
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
        group_concat(LodgingProsAndCons.keyword) as keyword
    FROM FeedProsAndCons, LodgingProsAndCons
    WHERE FeedProsAndCons.feedIndex = 1 and
        FeedProsAndCons.lodgingProsAndConsIndex = LodgingProsAndCons.lodgingProsAndConsIndex
    GROUP BY FeedProsAndCons.status;
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
    SELECT Airbnb.airbnbIndex as lodgingIndex,
                Airbnb.url as info,
                FeedLodging.airbnbDesc as address
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
    SELECT GeneralLodging.generalLodgingIndex as lodgingIndex,
            GeneralLodging.name as info,
            GeneralLodging.address as address
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

async function selectFeedComment(connection, feedCommentParams) {
    const selectFeedCommentQuery = `
     SELECT COMLIKE.commentIndex,
            COMLIKE.userIndex,
            COMLIKE.nickname,
            COMLIKE.avatarUrl,
            COMLIKE.content,
            COMLIKE.createdAt,
            COMLIKE.updatedAt,
            count(CommentLike.commentIndex) as likeNum
        FROM CommentLike
        INNER JOIN(
        SELECT Comment.commentIndex,
            Comment.userIndex,
            User.nickname,
            User.avatarUrl,
            Comment.content,
            Comment.createdAt,
            Comment.updatedAt
        FROM CommentLike, Comment, User
        WHERE (Comment.feedIndex = ? and
            Comment.userIndex = User.userIndex) or
            (Comment.feedIndex = ? and
            Comment.commentIndex = CommentLike.commentIndex and
            CommentLike.status = 'like' and
            Comment.userIndex = User.userIndex)
        GROUP BY Comment.commentIndex
        ) COMLIKE
        WHERE CommentLike.commentIndex = COMLIKE.commentIndex
        GROUP BY CommentLike.commentIndex;
                `;
    const [feedCommentInfoRow] = await connection.query(selectFeedCommentQuery, feedCommentParams);
    return feedCommentInfoRow;
}

module.exports = {
    selectImageList,
    selectLike,
    selectCorrection,
    selectSave,
    selectProsAndCons,
    selectFeedInfo,
    selectLodgingInfo,
    selectFeedComment,
};
  