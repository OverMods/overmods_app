import strftime from "strftime";

export function formatSqlTime(date) {
    return strftime("%y-%m-%d %H:%M:%S", date);
}

export function sqlTimeNow() {
    return formatSqlTime(new Date());
}