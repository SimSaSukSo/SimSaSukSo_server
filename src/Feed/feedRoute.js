module.exports = function(app){
    const feed = require('./feedController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.get('/api/feeds/home', jwtMiddleware, feed.index);
    app.get('/api/feeds/hot', jwtMiddleware, feed.hot);
    app.get('/api/feeds/new', jwtMiddleware, feed.new);

    app.post('/api/feeds', jwtMiddleware, feed.uploadGeneralLodging);
    app.post('/api/feeds/airbnb', jwtMiddleware, feed.uploadAirbnb);

    app.post('/api/saved-feeds', jwtMiddleware, feed.saveFeed);
};
