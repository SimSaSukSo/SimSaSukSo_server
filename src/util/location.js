// 주소로 locationId 추출
exports.getLocationIdByAddress = async (address) => {
    if (await address.includes("서울")) return 1000;
    else if (await address.includes("부산")) return 1001;
    else if (await address.includes("제주")) return 1002;
    else if (await address.includes("강원")) return 1003;
    else if (await address.includes("경기")) return 1004;
    else if (await address.includes("인천")) return 1005;
    else if (await address.includes("대구")) return 1006;
    else if (await address.includes("울산")) return 1007;
    else if (await address.includes("경남")) return 1008;
    else if (await address.includes("경북")) return 1009;
    else if (await address.includes("광주")) return 1010;
    else if (await address.includes("전남")) return 1011;
    else if (await address.includes("전북")) return 1012;
    else if (await address.includes("대전")) return 1013;
    else if (await address.includes("충남")) return 1014;
    else if (await address.includes("충북")) return 1015;
    else 1016; // 지역에 포함 안되는 경우 이후 수정 필요
}

// locationId로 지역명 추출
exports.getRegionNameByLocationId = (locationId) => {
    if (locationId == 1000) return "서울";
    else if (locationId == 1001) return "부산";
    else if (locationId == 1002) return "제주";
    else if (locationId == 1003) return "강원";
    else if (locationId == 1004) return "경기";
    else if (locationId == 1005) return "인천";
    else if (locationId == 1006) return "대구";
    else if (locationId == 1007) return "울산";
    else if (locationId == 1008) return "경남";
    else if (locationId == 1009) return "경북";
    else if (locationId == 1010) return "광주";
    else if (locationId == 1011) return "전남";
    else if (locationId == 1012) return "전북";
    else if (locationId == 1013) return "대전";
    else if (locationId == 1014) return "충남";
    else if (locationId == 1015) return "충북";
    else return "전체";
}

// locationId로 지역별 locationIndex 범위 추출;
exports.getLocationRangeByLocationId = (locationId) => {
    if (locationId == 1000) return [1, 22];
    else if (locationId == 1001) return [23, 37];
    else if (locationId == 1002) return [38, 44];
    else if (locationId == 1003) return [45, 55];
    else if (locationId == 1004) return [56, 77];
    else if (locationId == 1005) return [78, 88];
    else if (locationId == 1006) return [89, 96];
    else if (locationId == 1007) return [97, 98];
    else if (locationId == 1008) return [99, 110];
    else if (locationId == 1009) return [111, 123];
    else if (locationId == 1010) return [124, 127];
    else if (locationId == 1011) return [128, 140];
    else if (locationId == 1012) return [141, 148];
    else if (locationId == 1013) return [149, 152];
    else if (locationId == 1014) return [153, 165];
    else if (locationId == 1016) return [166, 172];
    else return [1, 172];
}