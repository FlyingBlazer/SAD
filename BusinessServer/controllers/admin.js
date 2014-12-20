var Errors = require('../lib/Errors');

exports.login = function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    req.models.administrator.one({name: username}, function(err, admin) {
        if(err && err.message != 'Not found') throw err;
        if(!admin) return next(new Errors.LoginFail('Invalid Username or Password'));
        if(password == admin.password){
            res.json({
                code: 0,
                message: 'success',
                adminId: admin.id,
                hospitalId: parseInt(admin.name.toString().slice(5)).toString()
            });
        }
    });
};

exports.change_password = function(req, res, next) {
    var username = req.body.username;
    var original_password = req.body.original_password;
    var new_password = req.body.new_password;
    req.models.administrator.one({name: username}, function(err, admin) {
        if(err && err.message != 'Not found') throw err;
        if(!admin) return next(new Errors.UpdatePasswordFail('Invalid Username'));
        if(original_password == admin.password){
            admin.password = new_password;
            admin.save(function(err) {
                if(err) throw err;
                res.json({
                    code: 0,
                    message: 'success',
                    adminId: admin.id,
                    hospitalId: parseInt(admin.id.toString().slice(5)).toString()
                });
            });
        } else return next(new Errors.UpdatePasswordFail('Invalid Original Password'));
    });
};