module.exports = function(app){
    const feedback = require('./feedbackController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    app.get('/api/feedbacks', jwtMiddleware, feedback.getList);
    app.post('/api/feedbacks', jwtMiddleware, feedback.createFeedback);
};