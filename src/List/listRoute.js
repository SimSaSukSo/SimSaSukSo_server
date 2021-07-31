module.exports = function(app){
    const list = require('./listController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.get('/api/lists', jwtMiddleware, list.allList);
    app.post('/api/lists', jwtMiddleware, list.newList);
    app.put('/api/lists', jwtMiddleware, list.updateList);
    app.delete('/api/lists/:idx', jwtMiddleware, list.deleteList);
    app.get('/api/lists/:idx', jwtMiddleware, list.feedsInSavedList);
};