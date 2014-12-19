var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    var hospitalId = req.query.hospitalId;
    req.db.driver.execQuery(
        "SELECT doctor.id as id, doctor.name as name, hospital.name as hospital, department.name as department, " +
        "doctor.title as title, doctor.info as description, doctor.photo as photo_url, department.id as department_id " +
        "FROM doctor, department, hospital WHERE doctor.department_id = department.id AND department.hospital_id = hospital.id " +
        "AND hospital.id = ?",
        [hospitalId],
        function(err, data) {
            if(err) throw err;
            var ret = {};
            data.forEach(function(line) {
                if(!Array.isArray(ret[line.department_id])) {
                    ret[line.department_id] = [];
                }
                ret[line.department_id].push(line);
            });
            res.json({
                code: 0,
                message: 'success',
                doctors: ret
            });
        }
    );
    //req.models.hospital.get(hospitalId, function(err, hospital) {
    //    if(err && err.message != 'Not found') return next(err);
    //    if(!hospital) return next(new Errors.HospitalNotExist("Department Not Exist"));
    //    var ret = {};
    //    hospital.departments.forEach(function(department) {
    //        if(!Array.isArray(ret[department.id])) {
    //            ret[department.id] = [];
    //        }
    //        department.doctors.forEach(function(doctor) {
    //            ret[department.id].push({
    //                id: doctor.id,
    //                name: doctor.name,
    //                hospital: hospital.name,
    //                department: department.name,
    //                title: doctor.title,
    //                description: doctor.info,
    //                photo_url: doctor.photo
    //            });
    //        });
    //    });
    //    res.json({
    //        code: 0,
    //        message: 'success',
    //        doctors: ret
    //    });
    //});
};

exports.add = function(req, res, next) {
    req.models.department.get(req.body.departmentId, function(err, department) {
        if(err && err.message != 'Not found') return next(err);
        req.models.doctor.create({
            name: req.body.name,
            photo: req.body.photo,
            info: req.body.description,
            title: req.body.title
        }, function(err, doctor) {
            if(err && err.message != 'Not found') return next(err);
            doctor.setDepartment(department, function(err) {
                if(err) return next(err);
                res.json({
                    code: 0,
                    message: 'success',
                    doctor_id: doctor.id
                });
            });
        });
    });
};

exports.remove = function(req, res, next) {
    req.models.doctor.get(req.params.doctorId, function(err, doctor) {
        if(err && err.message != 'Not found') return next(err);
        if(!doctor) return next(new Errors.DoctorNotExist('Doctor Not Exist'));
        doctor.remove(function(err) {
            if(err && err.message != 'Not found') return next(err);
            res.json({
                code: 0,
                message: 'success'
            });
        });
    });
};

exports.update = function(req, res, next) {
    req.models.doctor.get(req.params.doctorId, function(err, doctor) {
        if(err && err.message != 'Not found') return next(err);
        if(!doctor) return next(new Errors.DoctorNotExist('Doctor Not Exist'));
        for(var index in req.body) {
            doctor[index] = req.body[index];
        }
        doctor.save(function(err) {
            if(err) return next(err);
            res.json({
                code: 0,
                message: 'success'
            });
        });
    });
};

exports.detail = function(req, res, next) {
    req.models.doctor.get(req.params.doctorId, function(err, doctor) {
        if(err && err.message != 'Not found') return next(err);
        if(!doctor) return next(new Errors.DoctorNotExist('Doctor Not Exist'));
        doctor.getWorking(function(err, workings) {
            if(err) return next(err);
            var curDate = new Date();
            var year = curDate.getFullYear();
            var month = curDate.getMonth();
            var date = curDate.getDate() + 1;
            var day = curDate.getDay();
            var dd = new Date();
            var slot = [];
            for(var i = 0; i < 7; i++) {
                slot.push({
                    date: {
                        year: year,
                        month: month + 1,
                        date: dd.nextDay().getDate(),
                        day: (function() {
                            switch(dd.getDay()) {
                                case 1:
                                    return '星期一';
                                case 2:
                                    return '星期二';
                                case 3:
                                    return '星期三';
                                case 4:
                                    return '星期四';
                                case 5:
                                    return '星期五';
                                case 6:
                                    return '星期六';
                                case 0:
                                    return '星期日';
                            }
                        })()
                    },
                    slot: {
                        morning: false,
                        afternoon: false,
                        evening: false
                    }
                });
            }
            workings.forEach(function(working) {
                var tarDate = new Date(working.date);
                var key;
                switch(working.period) {
                    case 1:
                        key = 'morning';
                        break;
                    case 2:
                        key = 'afternoon';
                        break;
                    case 3:
                        key = 'evening';
                        break;
                }
                switch(working.frequency.charAt(0)) {
                    case '0':
                        var i = curDate.getDateOffset(tarDate);
                        if(i <= 7 && i > 0) {
                            slot[i].slot[key] = true;
                        }
                        break;
                    case '1':
                        slot.forEach(function(s) {
                            s.slot[key] = true;
                        });
                        break;
                    case '2':
                        for(var j=0; j < 7; j++) {
                            if(working.frequency.charAt(j) == '1') {
                                slot[j+day<=6?j+day:j+day-7].slot[key] = true;
                            }
                        }
                        break;
                    case '3':
                        var i = tarDate.getDate() - date;
                        if(i < 7 && i >= 0) {
                            slot[i].slot[key] = true;
                        }
                        break;
                }
            });
            doctor.getDepartment(function(err, department) {
                if(err) throw err;
                department.getHospital(function(err, hospital) {
                    if(err) throw err;
                    res.json({
                        code: 0,
                        message: 'success',
                        id: doctor.id,
                        name: doctor.name,
                        hospital: hospital.name,
                        department: department.name,
                        title: doctor.title,
                        description: doctor.info,
                        photo_url: doctor.photo,
                        time_slots: slot,
                        price: doctor.price
                    });
                });
            });
        });
    });
};