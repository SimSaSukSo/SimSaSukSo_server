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
