var Errors = require('../lib/Errors');

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
    req.models.hospital_rating.find({meaning: req.body.level}, function(err, rating) {
        if(err && err.message != 'Not found') return next(err);
        req.models.create({
            name: req.body.name,
            province: req.body.province,
            city: req.body.city,
            addr: req.body.address,
            tel: req.body.telephone,
            site: req.body.website
        }, function(err, hospital) {
            if(err && err.message != 'Not found') return next(err);
            hospital.setRating(rating, function(err) {
                if(err && err.message != 'Not found') return next(err);
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
                hospital.setRating(rating, function(err) {
                    if(err && err.message != 'Not found') return next(err);
                });
            });
        }
        for(var index in req.body) {
            hospital[index] = req.body[index];
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