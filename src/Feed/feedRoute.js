module.exports = function(app){
    const feed = require('./feedController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // Todo: jwt 미들웨어 설정하기
    app.get('/api/feed/home', feed.index);
    app.get('/api/feed/hot', feed.hot);
    app.get('/api/feed/new', feed.new);
};
