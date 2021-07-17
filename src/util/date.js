const moment = require('moment');

exports.isValidDate = (start, end) => {
    // 둘 다 적절한 날짜 맞는지
    if (!(isValidDateFormat(start) && isValidDateFormat(end))) return false;

    // 순서 맞는지
    if (start > end) return false;

    return true;
}

isValidDateFormat = (date) => {
    return moment(date, 'YYYY-MM-DD', true).isValid();
}
