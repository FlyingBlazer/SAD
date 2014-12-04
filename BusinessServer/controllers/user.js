var Errors = require('../lib/Errors');

exports.check = require('./user.check');

exports.login =function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    req.models.user.one({
        name: username,
        password: password
    }, function(err, user) {
        if(err) return next(err);
        if(!user) {
            return next(new Errors.LoginFail("Username or password error"));
        } else {
            res.json({
                errcode: 0,
                errmsg: 'success',
                username: username,
                token: 123
            });
        }
    });
};

exports.updateInfo = function(req, res, next){
    var phone=req.body.phone;
    var email=req.body.email;
    var myName=name;
    req.models.user.one({
        name: myName
    }, function(err, user){
        if(err){
            return next(err);
        }
        else if(!user){
            return next(new Errors.UserNotLogin("User not login"));
        }
        else{
            if(phone){
                user.tel=phone;
            }
            if(email){
                user.email=email;
            }
            user.save(function(err) {
                if(err) {
                    return next(err);
                }
                res.json({
                    errcode: 0,
                    errmsg: 'success',
                    username: myName
                });
            });
        }
    });
};

exports.signUp = function(req, res, next) {
    var username = req.body.username,
        password = req.body.password,
        id = req.body.id,
        phone = req.body.phone,
        name = req.body.name,
        email = req.body.email;
    //
};

exports.checkName = function(req, res, next) {
    var username = req.params.username;
    //
};

exports.info = function(req, res, next) {
    var userId = req.params.userId;
    //
};
