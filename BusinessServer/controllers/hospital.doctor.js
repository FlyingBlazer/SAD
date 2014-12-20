var Errors = require('../lib/Errors');

exports.working = require('./hospital.doctor.working');

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
};

exports.add = function(req, res, next) {
    req.models.department.get(req.body.departmentId, function(err, department) {
        if(err && err.message != 'Not found') return next(err);
        req.models.doctor.create({
            name: req.body.name,
            photo: req.body.photo,
            info: req.body.description,
            title: req.body.title,
            price: req.body.price
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
        if(err && err.message != 'Not found') {
            res.send(500, "Internal error");
            throw err;
        }
        if(!doctor) {
            res.send(500, "Doctor not exist.");
            throw err;
        }
        for(var index in req.body) {
            doctor[index] = req.body[index];
        }
        doctor.save(function(err) {
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

exports.detail = function(req, res, next) {
    function finish(){
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
    }
    req.models.doctor.get(req.params.doctorId, function(err, doctor) {
        if(err && err.message != 'Not found') return next(err);
        if(!doctor) return next(new Errors.DoctorNotExist('Doctor Not Exist'));
        doctor.getWorking(function(err, workings) {
            if(err) return next(err);
            var curDate = new Date();
            var year = curDate.getFullYear();
            var month = curDate.getMonth();
            var date = curDate.getDate() + 1;
            var day = (curDate.getDay()+6)%7+1;
            var dd = new Date();
            var slot = [];
            var hasTemp=[{morning: 0, afternoon: 0,evening: 0},{morning: 0, afternoon: 0,evening: 0},{morning: 0, afternoon: 0,evening: 0},
                        {morning: 0, afternoon: 0,evening: 0},{morning: 0, afternoon: 0,evening: 0},{morning: 0, afternoon: 0,evening: 0},
                        {morning: 0, afternoon: 0,evening: 0}];
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
                        morning: [false, 0, 0],
                        afternoon: [false, 0, 0],
                        evening: [false, 0, 0]
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
                            slot[i].slot[key][0] = (working.frequency.charAt(1) == '1');
                            slot[i].slot[key][1] =working.totalApp;
                            hasTemp[i][key] = 1;
                        }
                        break;
                    case '1':
                        slot.forEach(function(s) {
                            s.slot[key][0] = true;
                        });
                        break;
                    case '2':
                        for(var j=1; j <= 7; j++) {
                            if(working.frequency.charAt(j) == '1'&&hasTemp[(6-day+j)%7][key] == 0) {
                                slot[(6-day+j)%7].slot[key][0] = true;
                                slot[(6-day+j)%7].slot[key][1] =working.totalApp;
                            }
                        }
                        break;
                    case '3':
                        var i = tarDate.getDate() - date;
                        if(i < 7 && i >= 0) {
                            slot[i].slot[key][0] = true;
                        }
                        break;
                }
            });
            for(var i = 0; i < 7; i++){
                var t_date=slot[i].date.year+'-'+slot[i].date.month+'-'+slot[i].date.date;
                req.models.appointment.aggregate({time: t_date,doctor_id: req.params.doctorId, period: 1}).count('id').get(function(err, app_count) {
                   if(err) throw err;
                    slot[i].slot['morning'][2] = app_count;
                });
                req.models.appointment.aggregate({time: t_date,doctor_id: req.params.doctorId, period: 2}).count('id').get(function(err, app_count) {
                    if(err) throw err;
                    slot[i].slot['afternoon'][2] = app_count;
                });
                req.models.appointment.aggregate({time: t_date,doctor_id: req.params.doctorId, period: 3}).count('id').get(function(err, app_count) {
                    if(err) throw err;
                    slot[i].slot['evening'][2] = app_count;
                });
                if(i==7){
                    finish();
                }
            }
        });
    });
};