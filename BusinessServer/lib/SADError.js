var codes = {
    LOGIN_ERROR: 1,
    USER_EXISTED: 2,
    USER_NOT_LOGIN: 3
};

function SADError(message, code, extras) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    if (code) {
        this.code = codes[code];
        this.literalCode = code;
        if (!this.code) {
            throw new Error("Invalid error code: " +  code);
        }
    }
    if (extras) {
        for(var k in extras) {
            this[k] = extras[k];
        }
    }
}

SADError.prototype = Object.create(Error.prototype);
SADError.prototype.constructor = SADError;
SADError.prototype.name = 'SADError';
SADError.prototype.toString = function () {
    return '[SADError ' + this.literalCode + ': ' + this.message + ']';
};

SADError.codes = codes;

module.exports = SADError;
