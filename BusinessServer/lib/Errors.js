var restify = require('restify');
var util = require('util');

module.exports = {
    LoginFail: LoginFail,
    UserNotLogin: UserNotLogin,
    HospitalNotExist: HospitalNotExist,
    UserAlreadyExisted: UserAlreadyExisted,
    UserNotExist: UserNotExist
};

function LoginFail(message) {
    restify.RestError.call(this, {
        restCode: '1001',
        statusCode: 401,
        message: message,
        constructorOpt: LoginFail
    });
    this.name = 'LoginFail';
}
util.inherits(LoginFail, restify.RestError);

function UserNotLogin(message) {
    restify.RestError.call(this, {
        restCode: '1002',
        statusCode: 403,
        message: message,
        constructorOpt: UserNotLogin
    });
    this.name = 'UserNotLogin';
}
util.inherits(UserNotLogin, restify.RestError);

function UserAlreadyExisted(message) {
    restify.RestError.call(this, {
        restCode: '1011',
        statusCode: 403,
        message: message,
        constructorOpt: UserAlreadyExisted
    });
    this.name = 'UserAlreadyExisted';
}
util.inherits(UserAlreadyExisted, restify.RestError);

function UserNotExist(message) {
    restify.RestError.call(this, {
        restCode: '1012',
        statusCode: 404,
        message: message,
        constructorOpt: UserNotExist
    });
    this.name = 'UserNotExist';
}
util.inherits(UserNotExist, restify.RestError);

function HospitalNotExist(message) {
    restify.RestError.call(this, {
        restCode: '2001',
        statusCode: 404,
        message: message,
        constructorOpt: HospitalNotExist
    });
    this.name = 'HospitalNotExist';
}
util.inherits(HospitalNotExist, restify.RestError);