var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    req.models.hospital.find({}).only("id", "name").run(function(err, result) {
        if(err) return next(err);
        res.json({
            errcode: 0,
            errmsg: 'success',
            hospitals: result
        });
    });
};

exports.detail = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.get(id, function(err, result) {
        if(err) return next(err);
        if(!result) return next(new Errors.HospitalNotExist('HospitalNotExist'));
        res.json({
            errcode: 0,
            errmsg: "success",
            id: result.id,
            name: result.name,
            level: result.rating.meaning,
            province: result.province,
            city: result.city,
            address: result.addr,
            telephone: result.tel,
            website: result.site
        });
    });
};

exports.add = function(req, res, next) {
    req.models.hospital_rating.find({meaning: req.body.level}, function(err, rating) {
        if(err) return next(err);
        req.models.create({
            name: req.body.name,
            province: req.body.province,
            city: req.body.city,
            addr: req.body.address,
            tel: req.body.telephone,
            site: req.body.website
        }, function(err, hospital) {
            if(err) return next(err);
            hospital.setRating(rating, function(err) {
                if(err) return next(err);
            });
        });
    })
};

exports.remove = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.get(id, function(err, hospital) {
        if(err) return next(err);
        if(!result) return next(new Errors.HospitalNotExist('HospitalNotExist'));
        hospital.remove(function(err) {
            if(err) return next(err);
        });
    });
};

exports.update = function(req, res, next) {
    var id = req.params.hospitalId;
    req.models.hospital.get(id, function(err, hospital) {
        if(err) return next(err);
        if(!hospital) return next(new Errors.HospitalNotExist('HospitalNotExist'));
        if(typeof req.body.level != 'undefined') {
            var level = req.body.level;
            delete req.body.level;
            req.models.hospital_ratinga.one({meaning: level}, function(err, rating) {
                if(err) return next(err);
                hospital.setRating(rating, function(err) {
                    if(err) return next(err);
                });
            });
        }
        for(var index in req.body) {
            hospital[index] = req.body[index];
        }
        hospital.save(function(err) {
            if(err) return next(err);
        });
    });
};