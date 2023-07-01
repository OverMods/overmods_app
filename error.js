function declareError(code, text) {
    return { code, text };
}

export const errors = {
    INVALID_PARAMETER: declareError(1, "Invalid parameter"),
    UNAUTHORIZED: declareError(2, "Unauthorized"),
    INSUFFICIENT_PRIVILEGES: declareError(3, "Insufficient privileges"),
    USER_NOT_FOUND: declareError(4, "User not found"),
    INVALID_PASSWORD: declareError(5, "Invalid password"),
    ALREADY_AUTHORIZED: declareError(6, "Already logged in"),
    NOT_FOUND: declareError(7, "Not found"),
    FAILED: declareError(8, "Failed"),
    USER_ALREADY_EXISTS: declareError(9, "User already exists"),
    NOT_MODIFIED: declareError(10, "Not modified")
};

export function error(res, error) {
    res.json({ error: error });
}