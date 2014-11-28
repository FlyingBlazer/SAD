module.exports = {
    login: login
};

function login(req, res, next) {
    var username = req.params.name;
    var password = req.params.pass;
    req.models.user.one({
        name: username,
        password: password
    }, function(err, user) {
        if(err) return next(err);
        if(!user) {
            res.json({
                errcode: 233,
                errmsg: 'Username or password error'
            });
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