var Errors = require('../lib/Errors');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

exports.list = function(req, res, next) {
    var count = 0;
    var ret = [];
    if(typeof req.query.province != 'undefined') {
        req.models.hospital.find({province: req.query.province}, function(err, hospitals) {
            if(err && err.message != 'Not found') return next(err);
            parse(hospitals);
        });
    } else {
        req.models.hospital.find({}, function(err, hospitals) {
            if(err && err.message != 'Not found') return next(err);
            parse(hospitals);
        });
    }
    function parse(hospitals) {
        count = hospitals.length + 1;
        hospitals.forEach(function(hospital) {
            hospital.getRating(function(err, rating) {
                if(err && err.message != 'Not found') return next(err);
                ret.push({
                    id: hospital.id,
                    name: hospital.name,
                    level: rating.meaning,
                    province: hospital.province,
                    city: hospital.city,
                    address: hospital.addr,
                    telephone: hospital.tel,
                    website: hospital.site,
                    description: hospital.info
                });
                finish();
            });
        });
        finish();
    }
    function finish() {
        if(--count == 0) {
            res.json({
                code: 0,
                message: 'success',
                hospitals: ret
            });
        }
    }
};

exports.detail = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.hospital.get(id, function(err, result) {
        if(err && err.message != 'Not found') return next(err);
        if(!result) return next(new Errors.HospitalNotExist('HospitalNotExist'));
        result.getRating(function(err, rating) {
            if(err && err.message != 'Not found') return next(err);
            res.json({
                code: 0,
                message: "success",
                id: result.id,
                name: result.name,
                level: rating.meaning,
                province: result.province,
                city: result.city,
                address: result.addr,
                telephone: result.tel,
                website: result.site,
                description: result.info
            });
        });
    });
};

exports.add = function(req, res, next) {
    req.models.hospital_rating.one({meaning: req.body.level}, function(err, rating) {
        if(err && err.message != 'Not found') throw err;
        if(!rating) throw (new Errors.InvalidRating('Rating is invalid'));
        req.models.hospital.create({
            name: req.body.name,
            province: req.body.province,
            city: req.body.city,
            addr: req.body.address,
            tel: req.body.telephone,
            site: req.body.website,
            info: req.body.description,
            rating_id: rating.id
        }, function(err, hospital) {
            if(err) throw err;
            var supplement = 8 - hospital.id.toString().length;
            var admin_name ='admin';
            for(var i = 0; i < supplement ; i++) {
                admin_name += '0';
            }
            admin_name += hospital.id;
            var admin_password = md5.update('hosp' + admin_name).digest('hex');
            var authentication = 1;
            req.models.administrator.create({
                name: admin_name,
                password: admin_password,
                auth: authentication
            }, function(err,admin) {
                if(err && err.message != 'Not found') throw err;
                res.json({
                    code: 0,
                    message: 'success'
                });
            });
        });
    })
};

exports.remove = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.hospital.get(id, function(err, hospital) {
        if(err && err.message != 'Not found') return next(err);
        if(!hospital) return next(new Errors.HospitalNotExist('HospitalNotExist'));
        res.json({
            code: 0,
            message: 'success'
        });
        hospital.getDepartments().each(function(department) {
            department.getDoctors().each(function(doctor) {
                doctor.remove(function(err) {
                    if(err) {
                        console.log("Error occurred while removing doctor %s.", doctor.id);
                        throw err;
                    }
                    console.log("Doctor %s removed.", doctor.name);
                });
            });
            department.remove(function(err) {
                if(err) {
                    console.log("Error occurred while removing department %s.", department.id);
                    throw err;
                }
                console.log("Department %s removed.", department.name);
            });
        });
        var supplement = 8 - hospital.id.toString().length;
        var admin_name ='admin';
        for(var i = 0; i < supplement ; i++) {
            admin_name += '0';
        }
        admin_name += hospital.id;
        req.models.administrator.one({
           name: admin_name
        }, function(err, admin) {
            if(err && err.message != 'Not found') return next(err);
            admin.remove(function(err) {
               if(err){
                   throw err;
               }
            });
        });
        hospital.remove(function(err) {
            if(err) {
                console.log("Error occurred while removing hospital %s.", hospital.id);
                throw err;
            }
        });
    });
};

exports.update = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.hospital.get(id, function(err, hospital) {
        if(err && err.message != 'Not found') {
            res.send(500, "Internal error");
            throw err;
        }
        if(!hospital) {
            res.send(500, "Hospital not exist.");
            return;
        }
        if(typeof req.body.level != 'undefined') {
            var level = req.body.level;
            delete req.body.level;
            req.models.hospital_rating.one({meaning: level}, function(err, rating) {
                if(err && err.message != 'Not found') return next(err);
                console.log(level, rating);
                hospital.setRating(rating, function(err) {
                    if(err && err.message != 'Not found') throw err;
                });
            });
        }
        for(var index in req.body) {
            switch(index) {
                case 'telephone':
                    hospital.tel = req.body[index];
                    break;
                case 'website':
                    hospital.site = req.body[index];
                    break;
                case 'address':
                    hospital.addr = req.body[index];
                    break;
                case 'description':
                    hospital.info = req.body[index];
                    break;
                default:
                    break;
            }
        }
        hospital.save(function(err) {
            if(err) {
                res.send(500, "Internal error");
                throw err;
            }
            res.json({
                code: 0,
                message: 'success'
            });
        });
    });
};