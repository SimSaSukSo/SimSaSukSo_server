const userProvider = require("../../src/User/userProvider");
const {logger} = require("../../config/winston");
const userService = require("../../src/User/userService");
const baseResponse = require("../../config/baseResponseStatus");
const {response, errResponse} = require("../../config/response");
const axios = require("axios");
const regexEmail = require("regex-email");
const {emit} = require("nodemon");
const jwt = require("jsonwebtoken");
const path = require('path');
const AppleAuth = require('apple-auth');
const secret_config = require("../../config/secret");
const appleAuthConfig = require("../../config/appleAuthConfig");

const apple = new AppleAuth(appleAuthConfig, path.join(__dirname,'../../config/appleAuthKey/AuthKey_Y7C7V8VTBJ.p8'));

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

            try {
                const userResult = await userProvider.retrieveUser(email);

                const [userStatus] = await userProvider.retrieveKakaoStatus(email);

                // 이미 회원가입된 유저일 경우
                if(userResult != null && userResult != undefined && userResult.length != 0) {
                    try {
                        if(userStatus.status == 'suspended') {
                            return res.json(errResponse(baseResponse.USER_SUSPENDED));
                        }

                        let userIndex = userResult[0].userIndex;
                        // 회원가입 시 토큰 생성
                        let token = await jwt.sign(
                            {
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
                            
                            loginAgainResult.token = token;
                            return res.send(loginAgainResult);
                        }

                    } catch (err) {
                        console.log(err)
                        logger.error(`재로그인 중 Error`);
                        return res.json(errResponse(baseResponse.SERVER_ERROR));
                    }
                }
            } catch (err) {
                console.log(err);
                logger.error(`기존 유저 조회 중 Error`);
                return res.json(errResponse(baseResponse.DB_ERROR));
            }
            

            

            let result;
            let newUserResult;
            let userIndex;
            let userIndexResult;

            try {
                userIndexResult = await userService.kakaoCreateUser(nickname, kakaoId, avartarUrl, email);
                console.log(userIndexResult);
                // newUserResult = await userProvider.retrieveUser(email);
                // userIndex = newUserResult[0].userIndex;
                userIndex = userIndexResult;
            } catch (err) {
                console.log(err);
                logger.error(`신규 유저 생성 중 Error`);
                return res.json(errResponse(baseResponse.DB_ERROR));
            }

            let token;
            try {
                // 회원가입 시 토큰 생성
                token = await jwt.sign(
                {
                    userIndex: userIndex
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀키
                {
                    expiresIn: "365d",
                    subject: "userInfo",
                } // 유효 기간 365일
                );
            } catch (err) {
                console.log(err);
                logger.error(`토큰 생성 중 Error`);
                return res.json(errResponse(baseResponse.CREATE_TOKEN_ERROR));
            }

            result = errResponse(baseResponse.SUCCESS);
            
            // 토큰 생성 성공
            if (token) {
                result.token = token;
                return res.send(result);
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
    const userIndex = token.userIndex;

    // 닉네임 입력받음
    if (!nickname) {
        return res.json(errResponse(baseResponse.NICKNAME_EMPTY));
    }

    try {

        const userIdResult = await userProvider.retrieveUserByuserIndex(userIndex);

        if (!userIdResult || userIdResult == undefined || userIdResult == null) {
            return res.json(errResponse(baseResponse.JWT_USER_INVALID));
        }

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
            const nicknameResponse = await userService.setNickname(nickname, userIndex);
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

/**
 * API No. 3
 * API Name : 애플 로그인/ 회원가입
 * [POST] /app/users/appleLogin
 */
 exports.appleLogin = async function (req, res) {
    /**
     * Body: code
     */

    let { appleId, email, nickname } = req.body;

    if(!appleId)
        return res.send(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));

    try {
        const loginAgainResult = response(baseResponse.LOGIN_SUCCESS);
        const userResult = await userProvider.retrieveUserByAppleId(appleId);

        const [userStatus] = await userProvider.retrieveAppleStatus(appleId);

        // 이미 회원가입된 유저일 경우
        if (userResult != null && userResult != undefined && userResult.length != 0) {
            try {

                if(userStatus.status == 'suspended') {
                    return res.json(errResponse(baseResponse.USER_SUSPENDED));
                }

                const userIndex = userResult.userIndex;
                const email = userResult.email;
                const nickname = userResult.nickname;

                // 회원가입 시 토큰 생성
                let token = await jwt.sign(
                    {
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
                    loginAgainResult.token = token;
                    return res.send(loginAgainResult);
                }

            } catch (err) {
                console.log(err)
                logger.error(`재로그인 중 Error`);
                return res.json(errResponse(baseResponse.SERVER_ERROR));
            }
        }

        // 애플 회원가입
        if (!email || !nickname)
            return res.send(errResponse(baseResponse.UPLOAD_PARAMETER_EMPTY));

        const result = await userService.appleCreateUser(nickname, appleId, email);
        const newUserResult = await userProvider.retrieveUserByAppleId(appleId);
        let userIndex = newUserResult.userIndex;

        // 회원가입 시 토큰 생성
        let token = await jwt.sign(
        {
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
            let joinResult = response(baseResponse.SUCCESS);
            joinResult.token = token;
            return res.send(joinResult);
        }
    } catch (err) {
        console.log(err);
        logger.error(`애플 로그인/회원가입 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
};

exports.appleLoginCallback = async function (req, res) {
    return res.status(200).json();
}


exports.setProfileUrl = async function(req, res) {
    let { profileUrl } = req.body;

    const token = req.verifiedToken;
    const userIndex = token.userIndex;

    if(!profileUrl) {
        return res.json(errResponse(baseResponse.PROFILEURL_EMPTY));
    }

    try {
        const updateProfileUrlResult = await userService.updatePrfileUrl(profileUrl, userIndex);
        return res.send(response(baseResponse.SUCCESS));
    } catch (err) {
        console.log(err);
        logger.error(`프로필 사진 변경 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.deleteUser= async function(req, res) {
    const token = req.verifiedToken;
    const userIndex = token.userIndex;

    try {
        if(!userIndex) {
            return res.json(errResponse(baseResponse.USER_USERID_EMPTY));
        }

        const selectUserResult = await userProvider.retrieveUserByuserIndex(userIndex);

        if(!selectUserResult) {
            return res.json(errResponse(baseResponse.USER_USERID_NOT_EXIST));
        } else {
            const updateProfileUrlResult = await userService.deleteUser(userIndex);
            return res.send(response(baseResponse.SUCCESS));
        }
    } catch (err) {
        console.log(err);
        logger.error(`사용자 삭제 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}

exports.userInfo = async function(req, res) {
    const token = req.verifiedToken;
    const userIndex = token.userIndex;

    try {
        if(!userIndex) {
            return res.json(errResponse(baseResponse.USER_USERID_EMPTY));
        }

        const selectUserResult = await userProvider.retrieveUserByuserIndex(userIndex);

        if (selectUserResult) {
            const email = selectUserResult.email;
            const nickname = selectUserResult.nickname;
            const avatarUrl = selectUserResult.avatarUrl;
            const info = selectUserResult.kakaoId === null ? "apple" : "kakao";

            const result = {
                info,
                email,
                nickname,
                avatarUrl
            };
            
            return res.json(response(baseResponse.SUCCESS, result));
        } else {
            return res.json(errResponse(baseResponse.USER_USERID_NOT_EXIST));
        }
    } catch (err) {
        logger.error(`유저 정보 조회 중 Error`);
        return res.json(errResponse(baseResponse.DB_ERROR));
    }
}