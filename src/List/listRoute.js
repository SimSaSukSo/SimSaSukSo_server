module.exports = function(app){
    const list = require('./listController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.get('/api/lists', jwtMiddleware, list.index);
};
