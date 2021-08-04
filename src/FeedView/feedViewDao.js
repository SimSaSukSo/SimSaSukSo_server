
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
    SELECT COUNT(*) likeNum,
    FL.isLiked
    FROM FeedLike
    INNER JOIN(
    SELECT COUNT(*) as isLiked
    FROM FeedLike
    WHERE FeedLike.feedIndex = ? and
    FeedLike.userIndex = ? and
    FeedLike.status = 'like'
    ) FL
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
    WHERE FeedProsAndCons.feedIndex = ? and
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
    GROUP BY Comment.commentIndex;
                `;
    const [feedCommentInfoRow] = await connection.query(selectFeedCommentQuery, feedCommentParams);
    return feedCommentInfoRow;
}

async function selectFeedCommentIndex(connection, feedIndex) {
    const selectFeedCommentIndexQuery = `
        SELECT Comment.commentIndex
        FROM Comment
        WHERE Comment.feedIndex = ?;
                `;
    const [feedCommentIndexRow] = await connection.query(selectFeedCommentIndexQuery, feedIndex);
    return feedCommentIndexRow;
}

async function selectLikeNum(connection, commentIndex) {
    const likeNumQuery = `
    SELECT count(CommentLike.commentLikeIndex) as likeNum
    FROM CommentLike
    WHERE CommentLike.commentIndex = ? and
          CommentLike.status = 'like';
    `;

    const [likeNumRow] = await connection.query(likeNumQuery, commentIndex);
    return likeNumRow;
}

async function searchFeedYear(connection, params) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'pros'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) PROS
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 year) and
    Feed.feedIndex = PROS.feedIndex and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, params);
    return feedInfoRow;
}

async function searchFeedMonth(connection, params) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'pros'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) PROS
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 month) and
    Feed.feedIndex = PROS.feedIndex and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, params);
    return feedInfoRow;
}

async function searchFeedWeek(connection, params) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'pros'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) PROS
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -7 day) and
    Feed.feedIndex = PROS.feedIndex and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, params);
    return feedInfoRow;
}

async function searchFeedDay(connection, params) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'pros'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) PROS
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 day) and
    Feed.feedIndex = PROS.feedIndex and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, params);
    return feedInfoRow;
}

async function searchFeedHour(connection, params) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'pros'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) PROS
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 hour) and
    Feed.feedIndex = PROS.feedIndex and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, params);
    return feedInfoRow;
}

async function searchFeedProsAllYear(connection, paramsProsAll) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 year) and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, paramsProsAll);
    return feedInfoRow;
}

async function searchFeedProsAllMonth(connection, paramsProsAll) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 month) and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, paramsProsAll);
    return feedInfoRow;
}

async function searchFeedProsAllWeek(connection, paramsProsAll) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -7 day) and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, paramsProsAll);
    return feedInfoRow;
}

async function searchFeedProsAllDay(connection, paramsProsAll) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 day) and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, paramsProsAll);
    return feedInfoRow;
}

async function searchFeedProsAllHour(connection, paramsProsAll) {
    const getSearchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    fROM FeedImage
    INNER JOIN(
    SELECT DISTINCT Feed.feedIndex
    FROM Feed
    INNER JOIN(
    SELECT DISTINCT FeedProsAndCons.feedIndex,
                group_concat(FeedProsAndCons.lodgingProsAndConsIndex),
                group_concat(LodgingProsAndCons.keyword)
    FROM FeedProsAndCons,
    LodgingProsAndCons
    WHERE FeedProsAndCons.status = 'cons'
    and LodgingProsAndCons.lodgingProsAndConsIndex = FeedProsAndCons.lodgingProsAndConsIndex and
    FeedProsAndCons.lodgingProsAndConsIndex not in (?)
    GROUP BY FeedProsAndCons.feedIndex
    ) CONS
    INNER JOIN (
    SELECT generalLodgingIndex
    FROM GeneralLodging
    WHERE locationIndex = ?
    ) GENERAL
    INNER JOIN(
    SELECT Airbnb.airbnbIndex
    FROM Airbnb
    WHERE locationIndex = ?
    ) AIR
    WHERE ((Feed.lodgingType = 2 and
    Feed.lodgingIndex = AIR.airbnbIndex) or
    (Feed.lodgingType = 1 and
    Feed.lodgingIndex = GENERAL.generalLodgingIndex)) and
    Feed.charge >= ? and Feed.charge <= ? and
    Feed.updatedAt >= date_add(now(), interval -1 hour) and
    Feed.feedIndex = CONS.feedIndex
    ) FFEED
    WHERE FeedImage.feedIndex = FFEED.feedIndex and
    FeedImage.uploadOrder = 1
    ORDER BY FeedImage.createdAt DESC;
    `;
    const [feedInfoRow] = await connection.query(getSearchQuery, paramsProsAll);
    return feedInfoRow;
}

async function selectFeedLike(connection, param) {
    const selectQuery = `
        SELECT * FROM FeedLike WHERE userIndex = ? and feedIndex = ?;
    `;

    const [feedLike] = await connection.query(selectQuery, param);
    return feedLike
}

async function insertFeedLike(connection, param) {
    const insertQuery = `
        INSERT INTO FeedLike(userIndex, feedIndex) VALUES (?, ?);
    `;

    const [feedLike] = await connection.query(insertQuery, param);
    return feedLike
}

async function updateFeedLike(connection, param) {
    const updateQuery = `
        UPDATE FeedLike SET status = 'like' WHERE userIndex = ? and feedIndex = ?;
    `;

    const [feedLike] = await connection.query(updateQuery, param);
    return feedLike
}

async function updateFeedDislike(connection, param) {
    const updateQuery = `
        UPDATE FeedLike SET status = 'dislike' WHERE userIndex = ? and feedIndex = ?;
    `;

    const [feedDisike] = await connection.query(updateQuery, param);
    return feedDisike
}

async function postFeedComment(connection, insertParams) {
    const insertCommentQuery = `
        INSERT INTO Comment(userIndex, feedIndex, content) VALUES (?, ?, ?);
    `;

    const [postComment] = await connection.query(insertCommentQuery, insertParams);
    return postComment
}

async function putFeedComment(connection, putParams) {
    const putCommentQuery = `
        UPDATE Comment SET content = ? WHERE userIndex = ? and commentIndex = ? and feedIndex = ?;
    `;

    const [putComment] = await connection.query(putCommentQuery, putParams);
    return putComment
}

async function deleteFeedComment(connection, deleteParams) {
    const deleteCommentQuery = `
        DELETE FROM Comment WHERE userIndex = ? and commentIndex = ? and feedIndex = ?;
    `;

    const [deleteComment] = await connection.query(deleteCommentQuery, deleteParams);
    return deleteComment
}

async function getSearchLodgingD(connection, lodgings) {

    const stringq = "'%" + lodgings + "%'";

    const searchQuery = `
    SELECT generalLodgingIndex,
        name,
        locationIndex,
        address
    FROM GeneralLodging
    WHERE name LIKE ` + stringq;

    const [lodgingsResult] = await connection.query(searchQuery);
    return lodgingsResult
}

async function getSearchLodgingDT(connection, lodgingIndex) {

    const searchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    FROM FeedImage
    INNER JOIN(
    SELECT feedIndex
    FROM Feed
    WHERE lodgingType = 1
    and lodgingIndex = ?
    ) Feeds
    WHERE Feeds.feedIndex = FeedImage.feedIndex and
        FeedImage.uploadOrder = 1;
    `

    const [lodgingsResult] = await connection.query(searchQuery, lodgingIndex);
    return lodgingsResult
}

async function getSearchTagD(connection, tag) {

    const stringq = "'%" + tag + "%'";

    const searchQuery = `
    SELECT HashTag.keyword
    FROM HashTag
    WHERE keyword LIKE ` + stringq;

    const [tagResult] = await connection.query(searchQuery);
    return tagResult
}

async function getSearchTagDT(connection, tag) {

    const stringq = "'%" + tag + "%'";

    const searchQuery = `
    SELECT FeedImage.feedIndex,
        FeedImage.feedImageIndex,
        FeedImage.source
    FROM FeedImage
    INNER JOIN(
    SELECT FeedTag.feedIndex
    FROM HashTag, FeedTag
    WHERE keyword LIKE ` + stringq + `and
        FeedTag.hashTagIndex = HashTag.hashTagIndex
    ) Feeds
    WHERE Feeds.feedIndex = FeedImage.feedIndex and
        FeedImage.uploadOrder = 1;`;

    const [tagResult] = await connection.query(searchQuery);
    return tagResult
}

async function selectUserIndex_to(connection, feedIndex) {
    const select_to_Query = `
        SELECT userIndex
        FROM Feed
        WHERE feedIndex = ?;
    `;

    const [user_to_Result] = await connection.query(select_to_Query, feedIndex);
    return user_to_Result
}

async function reportFeed(connection, params) {
    const reportQuery = `
        INSERT INTO FeedReport(userIndex, feedIndex, userIndex_to) VALUES (?, ?, ?);
    `;

    const [reportResult] = await connection.query(reportQuery, params);
    return reportResult
}

async function selectReportFeed(connection, feedIndex) {
    const selectReportQuery = `
        SELECT feedReportIndex
        FROM FeedReport
        WHERE feedIndex = ?;
    `;

    const [selectReportResult] = await connection.query(selectReportQuery, feedIndex);
    return selectReportResult
}

async function deleteReportFeed(connection, feedIndex) {
    const deleteReportFeedQuery = `
        DELETE FROM Feed WHERE feedIndex = ?;
    `;

    const [deleteFeedResult] = await connection.query(deleteReportFeedQuery, feedIndex);
    return deleteFeedResult
}

async function deleteReportComment(connection, feedIndex) {
    const deleteReportCommentQuery = `
        DELETE FROM Comment WHERE feedIndex = ?;
    `;

    const [deleteCommentResult] = await connection.query(deleteReportCommentQuery, feedIndex);
    return deleteCommentResult
}

async function selectReportComment(connection, feedIndex) {
    const selectReportCommentQuery = `
        SELECT commentIndex
        FROM Comment
        WHERE feedIndex = ?;
    `;

    const [selectReportCommentResult] = await connection.query(selectReportCommentQuery, feedIndex);
    return selectReportCommentResult
}

async function deleteReportCommentLike(connection, commentIndex) {
    const deleteReportCommentLikeQuery = `
        DELETE FROM CommentLike WHERE commentIndex = ?;
    `;

    const [deleteCommentLikeResult] = await connection.query(deleteReportCommentLikeQuery, commentIndex);
    return deleteCommentLikeResult
}

async function deleteReportFeedImage(connection, feedIndex) {
    const deleteReportFeedImageQuery = `
        DELETE FROM FeedImage WHERE feedIndex = ?;
    `;

    const [deleteFeedImageResult] = await connection.query(deleteReportFeedImageQuery, feedIndex);
    return deleteFeedImageResult
}

async function deleteReportFeedLike(connection, feedIndex) {
    const deleteReportFeedLikeQuery = `
        DELETE FROM FeedLike WHERE feedIndex = ?;
    `;

    const [deleteFeedLikeResult] = await connection.query(deleteReportFeedLikeQuery, feedIndex);
    return deleteFeedLikeResult
}

async function deleteReportFeedProsAndCons(connection, feedIndex) {
    const deleteReportFeedProsAndConsQuery = `
        DELETE FROM FeedProsAndCons WHERE feedIndex = ?;
    `;

    const [deleteFeedProsAndConsResult] = await connection.query(deleteReportFeedProsAndConsQuery, feedIndex);
    return deleteFeedProsAndConsResult
}

async function deleteReportFeedTag(connection, feedIndex) {
    const deleteReportFeedTagQuery = `
        DELETE FROM FeedTag WHERE feedIndex = ?;
    `;

    const [deleteFeedTagResult] = await connection.query(deleteReportFeedTagQuery, feedIndex);
    return deleteFeedTagResult
}

async function deleteReportFeedTool(connection, feedIndex) {
    const deleteReportFeedToolQuery = `
        DELETE FROM FeedTool WHERE feedIndex = ?;
    `;

    const [deleteFeedToolResult] = await connection.query(deleteReportFeedToolQuery, feedIndex);
    return deleteFeedToolResult
}

async function deleteReportReliability(connection, feedIndex) {
    const deleteReportReliabilityQuery = `
        DELETE FROM Reliability WHERE feedIndex = ?;
    `;

    const [deleteReportReliabilityResult] = await connection.query(deleteReportReliabilityQuery, feedIndex);
    return deleteReportReliabilityResult
}

async function deleteReportSavedFeed(connection, feedIndex) {
    const deleteReportSavedFeedQuery = `
        DELETE FROM SavedFeed WHERE feedIndex = ?;
    `;

    const [deleteSavedFeedResult] = await connection.query(deleteReportSavedFeedQuery, feedIndex);
    return deleteSavedFeedResult
}

async function selectUserFeedReport(connection, params) {
    const selectUserFeedReportQuery = `
        SELECT feedReportIndex
        FROM FeedReport
        WHERE userIndex = ? and feedIndex = ?;
    `;

    const [reportCountResult] = await connection.query(selectUserFeedReportQuery, params);
    return reportCountResult
}

async function selectFeed(connection, feedIndex) {
    const selectFeedQuery = `
        SELECT *
        FROM Feed
        WHERE feedIndex = ?;
    `;

    const [selectFeedResult] = await connection.query(selectFeedQuery, feedIndex);
    return selectFeedResult
}

async function selectUserReportFeedCount(connection, userIndex) {
    const selectCountQuery = `
    SELECT COUNT(*) as userReportFeedCount
    FROM FeedReport
    INNER JOIN(
    SELECT FeedReport.feedIndex,
           COUNT(feedIndex) as reportCount
    FROM FeedReport
    WHERE userIndex_to = ?
    GROUP BY feedIndex
    ) FR
    WHERE FR.feedIndex = FeedReport.feedIndex and
          FR.reportCount >= 10
    GROUP BY FeedReport.feedIndex;
    `;

    const [selectCountResult] = await connection.query(selectCountQuery, userIndex);
    return selectCountResult;
}

async function suspendUser(connection, userIndex) {
    const suspendUserQuery = `
      UPDATE User SET status = 'suspended' WHERE userIndex = ?;
    `;
    const deleteUserRow = await connection.query(
      suspendUserQuery,
      userIndex
    );
    return deleteUserRow
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
    searchFeedYear,
    searchFeedMonth,
    searchFeedWeek,
    searchFeedDay,
    searchFeedHour,
    searchFeedProsAllYear,
    searchFeedProsAllMonth,
    searchFeedProsAllWeek,
    searchFeedProsAllDay,
    searchFeedProsAllHour,
    selectFeedLike,
    insertFeedLike,
    updateFeedLike,
    updateFeedDislike,
    postFeedComment,
    putFeedComment,
    deleteFeedComment,
    getSearchLodgingD,
    getSearchLodgingDT,
    getSearchTagD,
    getSearchTagDT,
    reportFeed,
    selectReportFeed,
    deleteReportFeed,
    deleteReportComment,
    selectReportComment,
    deleteReportCommentLike,
    deleteReportFeedImage,
    deleteReportFeedLike,
    deleteReportFeedProsAndCons,
    deleteReportFeedTag,
    deleteReportFeedTool,
    deleteReportReliability,
    deleteReportSavedFeed,
    selectUserFeedReport,
    selectFeed,
    selectFeedCommentIndex,
    selectLikeNum,
    selectUserIndex_to,
    selectUserReportFeedCount,
    suspendUser,
};
  