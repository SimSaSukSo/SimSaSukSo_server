module.exports = function(app){
    const feedback = require('./feedbackController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.get('/api/feedback', jwtMiddleware, feedback.getList);
};