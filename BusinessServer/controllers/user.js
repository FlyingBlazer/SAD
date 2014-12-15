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
                userid: user.id,
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
    req.models.user.create({
        name: username,
        realName: name,
        password: password,
        socialId: id,
        tel: phone,
        email: email
    }, function(err, user) {
        if(err) return next(err);
        res.json({
            errcode: 0,
            errmsg: 'success',
            username: username
        });
    });
};

exports.checkName = function(req, res, next) {
    var username = req.params.username;
    req.models.user.find({username: username}, function(err, users) {
        if(err) return next(err);
        if(users.length > 0) {
            return next(new Errors.UserAlreadyExisted('User Already Existed'));
        } else {
            res.json({
                errcode: 0,
                errmsg: 'success',
                username: username,
                taken: false
            });
        }
    })
};

exports.info = function(req, res, next) {
    var userId = req.params.userId;
    req.models.user.get(userId, function(err, user) {
        if(err) return next(err);
        if(!user) return next(new Errors.UserNotExist('User Not Exist'));
        var status_s;
        switch(user.isActivated){
            case 0:
                status_s = 'candidating';
                break;
            case 1:
                status_s = 'rejected';
                break;
            case 2:
                status_s = 'approved';
                break;
            case 3:
                status_s = 'deprived';
                break;
            default:
                return next(new Errors.InvalidUserStatus("Incalid User Status!"));
        }
        res.json({
            errocde: 0,
            errmsg: 'success',
            username: user.name,
            status: status_s,
            credit: user.credit,
            sid: user.socialId,
            name: user.realName,
            phone: user.tel,
            email: user.email
        });
    });
};
