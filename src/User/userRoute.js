module.exports = function(app){
    const user = require('./userController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 1. 카카오 소셜 로그인/ 회원가입 API
    app.route('/api/users/kakaoLogin').post(user.kakaoLogin);

    // 2. 닉네임 설정하기 API
    app.post('/api/users', jwtMiddleware, user.setNickname);

    // jwt를 사용하기 위해 jwtMiddleware 를 체이닝 방식으로 추가하는 예제
    // app.get('/app/users/:userId', jwtMiddleware, user.getUserById);

};