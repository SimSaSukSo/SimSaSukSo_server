module.exports = function(app){
    const feedView = require('./feedViewController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 2. 피드 정보 조회 API
    app.get('/api/feeds/:idx', jwtMiddleware, feedView.getFeed);
    
    // 3. 피드 댓글 정보 조회 API
    app.get('/api/feeds/:idx/comments', jwtMiddleware, feedView.getComment);

    // 4. 피드 검색 API
    app.post('/api/feeds/search/origin', jwtMiddleware, feedView.getSearch);

    // 피드 좋아요 API
    app.post('/api/feeds/:idx/like', jwtMiddleware, feedView.like);

    // 피드 좋아요 취소 API
    app.post('/api/feeds/:idx/dislike', jwtMiddleware, feedView.dislike);

    // 댓글 작성 API
    app.post('/api/feeds/:idx/comments', jwtMiddleware, feedView.postComment);

    // 댓글 수정 API
    app.put('/api/feeds/:idx/comments', jwtMiddleware, feedView.putComment);

    // 댓글 삭제 API
    app.delete('/api/feeds/:idx/comments', jwtMiddleware, feedView.deleteComment);

    app.post('/api/feeds/search/lodging', jwtMiddleware, feedView.getSearchLodging);

    app.get('/api/feeds/search/lodging/:idx', jwtMiddleware, feedView.getSearchLodging2);

    app.post('/api/feeds/search/tag', jwtMiddleware, feedView.getSearchTag);

    app.get('/api/feeds/search/tag', jwtMiddleware, feedView.getSearchTag2);

    app.get('/api/feeds/search/total', jwtMiddleware, feedView.getSearchTotal);

    app.post('/api/feeds/:idx/report', jwtMiddleware, feedView.report);

    // 댓글 좋아요 API
    app.post('/api/feeds/comments/:idx/like', jwtMiddleware, feedView.likeComment);

    // 댓글 좋아요 취소 API
    app.post('/api/feeds/comments/:idx/dislike', jwtMiddleware, feedView.dislikeComment);

    
    // jwt를 사용하기 위해 jwtMiddleware 를 체이닝 방식으로 추가하는 예제
    // app.get('/app/users/:userId', jwtMiddleware, user.getUserById);

};