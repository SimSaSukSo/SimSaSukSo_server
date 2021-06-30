module.exports = function(app){
    const feed = require('./feedController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // Todo: jwt 미들웨어 설정하기
    app.get('/api/feeds/home', feed.index);
    app.get('/api/feeds/hot', feed.hot);
    app.get('/api/feeds/new', feed.new);
};
