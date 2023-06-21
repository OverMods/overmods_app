import strtime from "strtime";
export const TIME_FORMAT = "%y-%m-%d %H:%M:%S";

export function formatSqlTime(date) {
    return strtime.strftime(date, TIME_FORMAT);
}

export function sqlTimeNow() {
    return formatSqlTime(new Date());
}

export function convertToDate(string) {
    return strtime.strptime(string, TIME_FORMAT)
}