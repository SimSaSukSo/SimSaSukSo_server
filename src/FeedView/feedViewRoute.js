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

    // jwt를 사용하기 위해 jwtMiddleware 를 체이닝 방식으로 추가하는 예제
    // app.get('/app/users/:userId', jwtMiddleware, user.getUserById);

};