class APIError {
    constructor(code, text) {
        this._code = code;
        this._text = text;
    }

    get code() {
        return this._code;
    }

    get text() {
        return this._text;
    }

    toString() {
        return `API Error ${this.code}: ${this.text}`;
    }
}

export class APIException extends Error {
    constructor(apiError) {
        super(apiError.text);
        this._code = apiError.code;
        this._text = apiError.text;
    }

    get code() {
        return this._code;
    }

    get text() {
        return this._text;
    }

    toString() {
        return `API Error ${this.code}: ${this.text}`;
    }
}

export const errors = {
    INVALID_PARAMETER: new APIError(1, "Invalid parameter"),
    UNAUTHORIZED: new APIError(2, "Unauthorized"),
    INSUFFICIENT_PRIVILEGES: new APIError(3, "Insufficient privileges"),
    USER_NOT_FOUND: new APIError(4, "User not found"),
    INVALID_PASSWORD: new APIError(5, "Invalid password"),
    ALREADY_AUTHORIZED: new APIError(6, "Already logged in"),
    NOT_FOUND: new APIError(7, "Not found"),
    FAILED: new APIError(8, "Failed"),
    USER_ALREADY_EXISTS: new APIError(9, "User already exists"),
    NOT_MODIFIED: new APIError(10, "Not modified")
};

export function error(res, error) {
    res.json({ error: error });
}