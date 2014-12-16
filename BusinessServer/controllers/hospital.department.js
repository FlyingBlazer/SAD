var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    req.models.hospital.get(req.params.hospitalId, function(err, hospital) {
        if(err) return next(err);
        if(!hospital) return next(new Errors.HospitalNotExist("Hospital not exist"));
        hospital.getDepartments(function(err, departments) {
            if(err) return next(err);
            var ret = [];
            departments.forEach(function(department) {
                ret.push({
                    id: department.id,
                    name: department.name,
                    phone: department.tel,
                    description: department.info
                });
            });
            res.json({
                errcode: 0,
                errmsg: 'success',
                count: ret.length,
                departments_list: ret
            });
        });
    });
};

exports.add = function(req, res, next) {
    var count = 2;
    var hospital;
    var department;
    function finish() {
        count -= 1;
        if(count === 0) {
            department.setHospital(hospital, function(err) {
                if(err) return next(err);
                res.json({
                    errcode: 0,
                    errmsg: 'success',
                    department_id: department.id
                });
            });
        }
    }
    req.models.hospital.get(req.body.hospital_id, function(err, hospital) {
        if(err) return next(err);
        if(!hospital) return next(new Errors.HospitalNotExist('Hospital not exist'));
        hospital = hospital;
        finish();
    });
    req.models.department.create({
        name: req.body.name,
        tel: req.body.phone,
        info: req.body.description
    }, function(err, dep) {
        if(err) return next(err);
        department = dep;
        finish();
    });
};

exports.remove = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err) return next(err);
        if(!department) return next(new Errors.DepartmentNotExist("Department not exist"));
        department.remove(function(err) {
            if(err) return next(err);
            res.json({
                errcode: 0,
                errmsg: 'success'
            });
        });
    });
};

exports.update = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err) return next(err);
        if(!department) return next(new Errors.DepartmentNotExist("Department not exist"));
        for(var index in req.body) {
            if(typeof department[index] != 'undefined') {
                department[index] = req.body[index];
            }
        }
        department.save(function(err) {
            if(err) return next(err);
            res.json({
                errcode: 0,
                errmsg: 'success'
            });
        });
    });
};

exports.detail = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err) return next(err);
        if(!department) return next(new Errors.DepartmentNotExist("Department not exist"));
        res.json({
            errcode: 0,
            errmsg: 'success',
            name: department.name,
            description: department.info,
            phone: department.tel
        });
    });
};