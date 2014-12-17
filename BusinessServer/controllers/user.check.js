var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    req.models.user.find({
        isActivated: 0
    }).only("id","name","socialId","realName").run(function(err, user) {
        if(err && err.message != 'Not found') return next(err);
        if(!user) {
            return next(new Errors.ListEmpty("All Users Have Been Activated"));
        } else {
        	var userlist=new Array();
        	for(i=0;i<user.length;i++){
        		userlist[i]["user_id"]=user[i].id;
				userlist[i]["username"]=user[i].name;
				userlist[i]["id"]=user[i].socialId;
				userlist[i]["name"]=user[i].realName;
        	}
            res.json({
                code: 0,
                message: 'success',
                users: userlist
            });
        }
    });
};

exports.approve = function(req, res, next) {
    var userId = req.body.userId;
    req.models.user.one({
        id: userId
    }, function(err, user) {
        if(err && err.message != 'Not found') return next(err);
        if(!user) {
            return next(new Errors.ApproveFail("Approve Fail!"));
        } else {
        	user.isActivated=1;
        	user.save(function (err) {
                if(err && err.message != 'Not found') return next(err);
    		});
            res.json({
                code: 0,
                message: 'success',
                username: user.name
            });
        }
    });
};

exports.reject = function(req, res, next) {
    var userId = req.body.userId;
    req.models.user.one({
        id: userId
    }, function(err, user) {
        if(err && err.message != 'Not found') return next(err);
        if(!user) {
            return next(new Errors.RejectFail("Reject Fail!"));
        } else {
        	user.isActivated=-1;
        	user.save(function (err) {
                if(err && err.message != 'Not found') return next(err);
    		});
            res.json({
                code: 0,
                message: 'success',
                username: user.name
            });
        }
    });
};

exports.status = function(req, res, next) {
    var userId = req.body.userId;
    req.models.user.one({
        name: userId
    }, function(err, user) {
        if(err && err.message != 'Not found') return next(err);
        if(!user) {
            return next(new Errors.FailToGetStatus("Fail To Get Status!"));
        } else {
        	var status_msg;
        	switch(user.isActivated){
        		case 1:
        			status_msg="Accepted";
        			break;
        		case 0:
        			status_msg="Validating";
        			break;
        		case -1:
        			status_msg="Rejected";
        			break;
        	}
            res.json({
                code: 0,
                message: 'success',
                user_id: user.id,
                username: user.name,
                status_code: user.isActivated,
                status: status_msg
            });
        }
    });
};