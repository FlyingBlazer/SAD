var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    req.models.hospital.get(req.params.hospitalId, function(err, hospital) {
        if(err && err.message != 'Not found') return next(err);
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
                code: 0,
                message: 'success',
                count: ret.length,
                departments_list: ret
            });
        });
    });
};

exports.add = function(req, res, next) {
    req.models.hospital.get(req.body.hospital_id, function(err, hospital) {
        if(err && err.message != 'Not found') throw err;
        if(!hospital) return next(new Errors.HospitalNotExist('Hospital not exist'));
        req.models.department.create({
            name: req.body.name,
            tel: req.body.phone,
            info: req.body.description,
            hospital_id: hospital.id
        }, function(err) {
            if(err) throw err;
            res.json({
                code: 0,
                message: 'success',
                department_id: department.id
            });
        });
    });
};

exports.remove = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err && err.message != 'Not found') return next(err);
        if(!department) return next(new Errors.DepartmentNotExist("Department not exist"));
        res.json({
            code: 0,
            message: 'success'
        });
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
        });
    });
};

exports.update = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err && err.message != 'Not found') {
            res.send(500, "Internal error");
            throw err;
        }
        if(!department) {
            res.send(500, "Department not exist.");
            return;
        }
        for(var index in req.body) {
            switch(index) {
                case 'phone':
                    department.tel = req.body[index];
                    break;
                case 'description':
                    department.info = req.body[index];
                    break;
                default:
                    break;
            }
        }
        department.save(function(err) {
            if(err && err.message != 'Not found') return next(err);
            res.json({
                code: 0,
                message: 'success'
            });
        });
    });
};

exports.detail = function(req, res, next) {
    req.models.department.get(req.params.departmentId, function(err, department) {
        if(err && err.message != 'Not found') return next(err);
        if(!department) return next(new Errors.DepartmentNotExist("Department not exist"));
        res.json({
            code: 0,
            message: 'success',
            name: department.name,
            description: department.info,
            phone: department.tel
        });
    });
};