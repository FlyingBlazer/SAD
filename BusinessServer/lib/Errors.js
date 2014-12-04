var restify = require('restify');
var util = require('util');

module.exports = {
    LoginFail: LoginFail,
    UserNotLogin: UserNotLogin
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