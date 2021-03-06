const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');

module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());

    /* App (Android, iOS) */
    require('../src/User/userRoute')(app);
    require('../src/Feed/feedRoute')(app);
    require('../src/FeedView/feedViewRoute')(app);
    require('../src/List/listRoute')(app);
    require('../src/Feedback/feedbackRoute')(app);

    return app;
};