require('dotenv').config();

const appleAuthConfig = {
    client_id: process.env.APPLE_CLIENT_ID,
    team_id: process.env.APPLE_TEAM_ID,
    redirect_uri: process.env.APPLE_REDIRECT_URI,
    key_id: process.env.APPLE_KEY_ID,
    scope: 'name email',
};

module.exports = {
    appleAuthConfig
};