var Errors = require('../lib/Errors');
var crypto = require('crypto');
exports.check = require('./user.check');

exports.login =function(req, res, next) {
    var md5 = crypto.createHash('md5');
    var username = req.body.username;
    var password = req.body.password;
    md5.update("sad"+password);
    req.models.user.one({
        name: username,
        password: md5.digest("hex")
    }, function(err, user) {
        if(err && err.message != 'Not found') throw err;
        if(!user) {
            return next(new Errors.LoginFail("Username or password error"));
        } else {
            res.json({
                code: 0,
                message: 'success',
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
    var pass_prev=req.body.pre_pw;
    var pass_curr=req.body.new_pw;
    req.models.user.get(req.params.userId, function(err, user){
        if(err && err.message != 'Not found') throw err;
        else if(!user){
            return next(new Errors.UserNotLogin("User not login"));
        }

        if(pass_prev){
            var md5 = crypto.createHash('md5');
            md5.update("sad"+pass_prev);
            if(user.password!=md5.digest("hex")){
                return next(new Errors.UpdatePasswordFail("Incorrect password"));
            }
            else if(pass_curr){
                md5.update("sad"+pass_curr);
                user.password=md5.digest("hex");
            }
            else{
                return next(new Errors.UpdatePasswordFail("No new password"));
            }
        }
        
        if(phone){
            user.tel=phone;
        }
        if(email){
            user.email=email;
        }
        user.save(function(err) {
            if(err) {
                throw err;
            }
            res.json({
                code: 0,
                message: 'success',
                username: user.name
            });
        });
    });
};

exports.signUp = function(req, res, next) {
    var md5 = crypto.createHash('md5');
    var username = req.body.username,
        password = req.body.password,
        id = req.body.id,
        phone = req.body.phone,
        name = req.body.name,
        email = req.body.email,
        uip = req.body.ip || '';
        md5.update("sad"+password);
    function finish(){
        req.models.user.create({
            name: username,
            realName: name,
            password: md5.digest('hex'),
            socialId: id,
            tel: phone,
            email: email,
            credit: 5,
            isActivated: 0,
            ip: uip
        }, function(err, user) {
            if(err) throw err;
            res.json({
                code: 0,
                message: 'success',
                userid: user.id
            });
        });
    }
    req.models.user.one({name: username, isActivated: -1}, function(err, user) {
        if(err && err.message != 'Not found') throw err;
        if (!user) {
            finish();
        } else {
            user.remove(function (err) {
                if (err) throw err;
                finish();
            });
        }
    });
};

exports.checkName = function(req, res, next) {
    var username = req.params.username;
    req.models.user.find({name: username}, function(err, users) {
        if(err && err.message != 'Not found') throw err;
        if(users && users.length > 0) {
            users.forEach(function(user) {
               if(user.isActivated != -1){
                   return next(new Errors.UserAlreadyExisted('User Already Existed'));
               }
            });
        } else {
            res.json({
                code: 0,
                message: 'success',
                username: username,
                taken: false
            });
        }
    })
};

exports.info = function(req, res, next) {
    var userId = req.params.userId;
    req.models.user.get(userId, function(err, user) {
        if(err && err.message != 'Not found') throw err;
        if(!user) return next(new Errors.UserNotExist('User Not Exist'));
        var status_s;
        switch(parseInt(user.isActivated)) {
            case 1:
                status_s="Accepted";
                break;
            case 0:
                status_s="Validating";
                break;
            case -1:
                status_s="Rejected";
                break;
            case -2:
                status_s="Out of credit";
                break;
            default:
                console.log(user.isActivated);
                return next(new Errors.InvalidUserStatus("Invalid User Status!"));
        }
        res.json({
            code: 0,
            message: 'success',
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
