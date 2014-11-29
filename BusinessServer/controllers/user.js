var SADError = require('../lib/SADError');

module.exports = {
    login: login
};

function login(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    req.models.user.one({
        name: username,
        password: password
    }, function(err, user) {
        if(err) return next(err);
        if(!user) {
            return next(new SADError("Username or password error", "LOGIN_ERROR"));
        } else {
            res.json({
                errcode: 0,
                errmsg: 'success',
                username: username,
                token: 123
            });
        }
    });
}