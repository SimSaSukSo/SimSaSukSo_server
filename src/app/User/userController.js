const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const {logger} = require("../../../config/winston");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const axios = require("axios");
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const jwt = require("jsonwebtoken");
const secret_config = require("../../../config/secret");

/**
 * API No. 1
 * API Name : 카카오 로그인/ 회원가입
 * [POST] /app/users/kakaoLogin
 */
 exports.kakaoLogin = async function (req, res) {
    /**
     * Body: accessToken
     */
    const accessToken = req.body.accessToken;
    const api_url = "https://kapi.kakao.com/v2/user/me";
    var email, nickname;
    
    if(!accessToken)
        return res.send(errResponse(baseResponse.ACCESSTOKEN_EMPTY))
    
    try {
        axios({
            url: api_url,
            method: 'get',
            headers: {
                Authorization: 'Bearer ' + accessToken,
            }
        }).then(async function (response) {
            kakaoId = response.data.id;
            email = response.data.kakao_account.email;
            avartarUrl = response.data.kakao_account.profile.profile_image_url;
            nickname = response.data.kakao_account.profile.nickname;

            logger.info(kakaoId);
            logger.info(email);
            logger.info(avartarUrl);
            logger.info(nickname);

            const [userResult] = await userProvider.retrieveUser(email);
            console.log(userResult);
            // 이미 회원가입된 유저일 경우
            if(userResult) {
                return res.json(errResponse(baseResponse.KAKAOUSER_REDUNDANT));
            }

            const result = await userService.kakaoCreateUser(nickname, kakaoId, avartarUrl, email);

            // 회원가입 시 토큰 생성
            let token = await jwt.sign(
            {
                kakaoId: kakaoId,
                nickname: nickname,
                email: email
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "userInfo",
            } // 유효 기간 365일
            );
            
            // 토큰 생성 성공
            if (token) {
                const tokenRes = {
                    result,
                    "token": token
                };
                return res.send(tokenRes);
            }

        }).catch(function (error) {
            result = errResponse(baseResponse.ACCESSTOKEN_ERROR);
            
            try {
                if (error['response']['data']) {
                    const errorData = error['response']['data'];
                    console.log(errorData);
                    result.errorMessage = errorData['msg'];
                }
            } catch(err) {
                return res.send(result);
            }
            

            return res.send(result);
            
            });
    } catch (err) {
        logger.error(`카카오 소셜 로그인/회원가입 중 Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
};