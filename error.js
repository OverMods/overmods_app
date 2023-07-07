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

    toJson() {
        return {
            code: this.code,
            text: this.text
        };
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

export class BanError extends APIError {
    constructor(ban) {
        super(11, "Banned");
        this.reason = ban ? ban.reason : null;
    }

    toJson() {
        const base = super.toJson();
        const json = {reason: this.reason};
        return {...base, ...json};
    }
}

export const errors = {
    INVALID_PARAMETER: () => new APIError(1, "Invalid parameter"),
    UNAUTHORIZED: () => new APIError(2, "Unauthorized"),
    INSUFFICIENT_PRIVILEGES: () => new APIError(3, "Insufficient privileges"),
    USER_NOT_FOUND: () => new APIError(4, "User not found"),
    INVALID_PASSWORD: () => new APIError(5, "Invalid password"),
    ALREADY_AUTHORIZED: () => new APIError(6, "Already logged in"),
    NOT_FOUND: () => new APIError(7, "Not found"),
    FAILED: () => new APIError(8, "Failed"),
    USER_ALREADY_EXISTS: () => new APIError(9, "User already exists"),
    NOT_MODIFIED: () => new APIError(10, "Not modified"),
    BANNED: (ban) => new BanError(ban)
};

export function error(res, func) {
    const error = func(...Object.values(arguments).slice(2));
    res.json({
        error: error.toJson()
    });
}