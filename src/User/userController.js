const jwtMiddleware = require("../../config/jwtMiddleware");
const userProvider = require("../../src/User/userProvider");
const {logger} = require("../../config/winston");
const userService = require("../../src/User/userService");
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");
const axios = require("axios");
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const jwt = require("jsonwebtoken");
const secret_config = require("../../config/secret");

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
        return res.send(errResponse(baseResponse.ACCESSTOKEN_EMPTY));
    
    try {
        const loginAgainResult = response(baseResponse.LOGIN_SUCCESS);
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
                try {
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
                        loginAgainResult.token = token;
                        return res.send(loginAgainResult);
                    }

                } catch (err) {
                    console.log(err)
                    logger.error(`재로그인 중 Error`);
                    return res.json(errResponse(baseResponse.SERVER_ERROR));
                }
            }

            const result = await userService.kakaoCreateUser(nickname, kakaoId, avartarUrl, email);

            // 회원가입 시 토큰 생성
            let token = await jwt.sign(
            {
                kakaoId: kakaoId,
                nickname: nickname,
                email: email,
                userIndex: userIndex
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
            console.log(error);
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
        console.log(err);
        logger.error(`카카오 소셜 로그인/회원가입 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
};

/**
 * API No. 2
 * API Name : 닉네임 설정
 * [POST] /app/users
 */
exports.setNickname = async function (req, res) {
    const nickname = req.query.nickname;

    const token = req.verifiedToken;
    const kakaoId = token.kakaoId;

    // 닉네임 입력받음
    if (!nickname) {
        return res.json(errResponse(baseResponse.NICKNAME_EMPTY));
    }

    try {
        // 영문/숫자 포함 8자 이내 확인
        var regType = /^[A-Za-z0-9+]{0,8}$/;
        try {
            if (!regType.test(nickname.toString())) {
                console.log(regType.test((nickname).value));
                return res.json(errResponse(baseResponse.NICKNAME_INVALID));
            }
        } catch (err) {
            console.log(err);
            logger.error(`닉네임 영문/숫자 포함 8자 이내 여부 확인 중 Error`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }
        
        try {
            // 닉네임 중복 여부 확인
            const nicknameList = await userProvider.retrieveNickname(nickname);
            console.log(nicknameList);
            if (nicknameList) {
                return res.json(errResponse(baseResponse.NICKNAME_REDUNDANT));
            }
        } catch (err) {
            console.log(err);
            logger.error(`닉네임 중복 여부 확인 중 Error`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        try {
            // 닉네임 설정
            const nicknameResponse = await userService.setNickname(nickname, kakaoId);
            return res.send(nicknameResponse);
        } catch (err) {
            logger.error(`닉네임 설정 중 Error\n: ${JSON.stringify(err)}`);
            return res.json(errResponse(baseResponse.DB_ERROR));
        }

        

    } catch(err) {
        logger.error(`닉네임 설정 API 중 Error\n: ${JSON.stringify(err)}`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }

};