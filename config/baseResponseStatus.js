module.exports = {

    // Success
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },
    LOGIN_SUCCESS: { "isSuccess": true, "code": 1001, "message":"재로그인 성공" },

    // Common
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" }, // ?
    ACCESSTOKEN_EMPTY : {"isSuccess": false, "code": 2000, "message":"액세스 토큰을 입력해주세요."},
    ACCESSTOKEN_ERROR : { "isSuccess": false, "code": 2019, "message": "액세스 토큰 에러" },

    //Request error
    NICKNAME_EMPTY : { "isSuccess": false, "code": 2001, "message":"닉네임을 입력해주세요" },
    NICKNAME_INVALID : { "isSuccess": false, "code": 2002, "message":"닉네임은 영문/숫자 포함 8자 이내로 작성해주세요." },
    NICKNAME_REDUNDANT : { "isSuccess": false, "code": 2003, "message":"다른 분이 사용하고 있는 닉네임입니다." },

    
    SIGNUP_PASSWORD_EMPTY : { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
    SIGNUP_PASSWORD_LENGTH : { "isSuccess": false, "code": 2005, "message":"비밀번호는 6~20자리를 입력해주세요." },
    SIGNUP_NICKNAME_EMPTY : { "isSuccess": false, "code": 2006, "message":"닉네임을 입력 해주세요." },
    SIGNUP_NICKNAME_LENGTH : { "isSuccess": false,"code": 2007,"message":"닉네임은 최대 20자리를 입력해주세요." },

    SIGNIN_EMAIL_EMPTY : { "isSuccess": false, "code": 2008, "message":"이메일을 입력해주세요" },
    SIGNIN_EMAIL_LENGTH : { "isSuccess": false, "code": 2009, "message":"이메일은 30자리 미만으로 입력해주세요." },
    SIGNIN_EMAIL_ERROR_TYPE : { "isSuccess": false, "code": 2010, "message":"이메일을 형식을 정확하게 입력해주세요." },
    SIGNIN_PASSWORD_EMPTY : { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

    USER_USERID_EMPTY : { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
    USER_USERID_NOT_EXIST : { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

    USER_USEREMAIL_EMPTY : { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
    USER_USEREMAIL_NOT_EXIST : { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
    USER_ID_NOT_MATCH : { "isSuccess": false, "code": 2016, "message": "유저 아이디 값을 확인해주세요" },
    USER_NICKNAME_EMPTY : { "isSuccess": false, "code": 2017, "message": "변경할 닉네임 값을 입력해주세요" },

    USER_STATUS_EMPTY : { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

    REGION_EMPTY : { "isSuccess": false, "code": 2030, "message": "지역을 입력해주세요." },

    // related upload
    UPLOAD_PARAMETER_EMPTY : { "isSuccess": false, "code": 2040, "message": "파리미터가 부족합니다." },
    UPLOAD_PARAMETER_INVALID : { "isSuccess": false, "code": 2041, "message": "유효하지 않은 파라미터가 존재합니다." },

    // related saved list
    SL_PARAMETER_INVALID : { "isSuccess": false, "code": 2050, "message": "존재하지 않는 찜목록입니다." },

    // Response error
    SIGNUP_REDUNDANT_EMAIL : { "isSuccess": false, "code": 3001, "message":"중복된 이메일입니다." },
    SIGNUP_REDUNDANT_NICKNAME : { "isSuccess": false, "code": 3002, "message":"중복된 닉네임입니다." },

    SIGNIN_EMAIL_WRONG : { "isSuccess": false, "code": 3003, "message": "아이디가 잘못 되었습니다." },
    SIGNIN_PASSWORD_WRONG : { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
    SIGNIN_INACTIVE_ACCOUNT : { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
    SIGNIN_WITHDRAWAL_ACCOUNT : { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

    KAKAOUSER_REDUNDANT : {"isSuccess": false, "code": 3007, "message": "이미 가입된 유저입니다. 바로 로그인해주세요." },

    FEED_EMPTY : {"isSuccess": false, "code": 3010, "message": "피드 정보가 존재하지 않습니다." },
    FEED_COMMENT_EMPTY : {"isSuccess": false, "code": 3011, "message": "피드 댓글 정보가 존재하지 않습니다." },

    REGION_WRONG : { "isSuccess": false, "code": 3030, "message": "유효하지 않은 지역입니다." },
    PAGE_WRONG : { "isSuccess": false, "code": 3031, "message": "유효하지 않은 페이지입니다." },

    //Connection, Transaction 등의 서버 오류
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},
}