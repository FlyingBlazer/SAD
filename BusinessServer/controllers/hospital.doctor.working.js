var Errors = require('../lib/errors');

exports.getRaw = function(req, res, next) {
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var week_stat=[[0,0,0],[0,0,0],[0,0,0],
            [0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        var temp_stat=[];
        req.models.working.find({doctor_id: doctorId}, function(err, workings) {
            if(err && err.message != 'Not found') return next(err);
            workings.forEach(function(working){
                console.log(working.frequency);
                switch(working.frequency.charAt(0)){
                    case '0':
                        var date = new Date(working.date);
                        var curDate = new Date();
                        if(date.Format('yyyyMMdd') < curDate.Format('yyyyMMdd')) break;
                        var temp_working={
                            date: working.date,
                            period: working.period,
                            capacity: working.frequency.charAt(1)=='1'? working.totalApp : 0
                        };
                        temp_stat.push(temp_working);
                        break;
                    case '2':
                        for(var i = 1 ; i <= 7 ; i++){
                            if(working.frequency.charAt(i)=='1'){
                                week_stat[i-1][working.period-1]=working.totalApp;
                            }
                        }
                        break;
                }
            });
            res.json({
                code: 0,
                message: 'success',
                week: week_stat,
                temp: temp_stat
            });
        });
    });
};

exports.addWeek = function(req, res, next) {
    var count = 3;
    function finish(){
        if(--count==0) {
            res.json({
                code: 0,
                message: 'success'
            });
        }
    }
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var new_working=req.body.day;
        var morning = '20000000';
        var afternoon = '20000000';
        var evening = '20000000';
        var morning_app = 0;
        var afternoon_app = 0;
        var evening_app = 0;
        for(var i = 0 ; i < 7 ; i++) {
            morning = morning.replaceAt(i + 1, new_working[i][0]!=0 ? 1 : 0);
            afternoon = afternoon.replaceAt(i + 1, new_working[i][1]!=0 ? 1 : 0);
            evening = evening.replaceAt(i + 1, new_working[i][2]!=0 ? 1 : 0);
            morning_app=new_working[i][0]!=0 ? new_working[i][0] : morning_app;
            afternoon_app=new_working[i][1]!=0 ? new_working[i][1] : afternoon_app;
            evening_app=new_working[i][2]!=0 ? new_working[i][2] : evening_app;
        }
        var date=new Date();
        req.models.working.get(doctorId, function(err, workings) {
            if(err && err.message != 'Not found') return next(err);
            if(workings) {
                return next(new Errors.AddingFailed("Working Arrangement Already Exists!"));
            }
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 1,
                frequency: morning,
                price : data[0]['price'],
                totalApp: morning_app
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 2,
                frequency: afternoon,
                price : data[0]['price'],
                totalApp: afternoon_app
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 3,
                frequency: evening,
                price : data[0]['price'],
                totalApp: evening_app
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
        });
    });
};

exports.updateWeek = function(req, res, next) {
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var works=req.body.works;
        var morning='20000000';
        var afternoon='20000000';
        var evening='20000000';
        req.models.working.find({doctor_id: doctorId}, function(err, workings){
            if(err && err.message != 'Not found') return next(err);
            var m_index=0;
            var a_index=0;
            var e_index=0;
            for(var i=0;i<3;i++){
                switch(workings[i]['period']) {
                    case 1:
                        m_index=i;
                        break;
                    case 2:
                        a_index=i;
                        break;
                    case 3:
                        e_index=i;
                        break;
                }
            }
            for(var i = 0 ; i < works.length ; i++) {
                switch(works[i]['period']) {
                    case 0:
                        workings[m_index].frequency = workings[m_index].frequency.replaceAt(works[i]['day'], works[i]['action']!=0 ? 1 : 0);
                        workings[m_index].totalApp=works[i]['action'];
                        break;
                    case 1:
                        workings[a_index].frequency = workings[a_index].frequency.replaceAt(works[i]['day'], works[i]['action']!=0 ? 1 : 0);
                        workings[a_index].totalApp=works[i]['action'];
                        break;
                    case 2:
                        workings[e_index].frequency = workings[e_index].frequency.replaceAt(works[i]['day'], works[i]['action']!=0 ? 1 : 0);
                        workings[e_index].totalApp=works[i]['action'];
                        break;
                }
            }
            var count = workings.length;
            workings.forEach(function(working) {
                working.save(function(err) {
                    if(err) throw err;
                    finish();
                });
            });
            function finish() {
                if(--count == 0) {
                    res.json({
                        code: 0,
                        message: 'success'
                    });
                }
            }
        });
    });
};

exports.addTemp = function(req, res, next) {
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var t_period = req.body.period;
        var t_action = req.body.action;
        var t_capacity = req.body.capacity;
        var t_frequency = '0_000000';
        req.models.working.one({
            doctor_id: doctorId,
            frequency: t_frequency,
            period: t_period
        }, function (err, working) {
            if (err && err.message != 'Not found') return next(err);
            if (working) {
                throw new Error.WorkingAlreadyExist("Working already Exists!");
            }
            t_frequency = t_frequency.replaceAt(1, t_action==0 ? 0 : 1);
            req.models.working.create({
                doctor_id: doctorId,
                frequency: t_frequency,
                period: t_period,
                totalApp: t_capacity
            }, function (working) {
                if (err && err.message != 'Not found') return next(err);
                res.json({
                    code: 0,
                    message: 'success'
                })
            });
        });
        //
    });
};

exports.deleteTemp = function(req, res, next) {
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var w_date = req.body.date;
        var w_period = req.body.period;
        req.db.driver.execQuery(
            "SELECT id FROM working WHERE date=? AND period=? AND frequency LIKE '?' LIMIT 1",
            [w_date, w_period, '0_000000'],
            function (err, w_data) {
                if (err && err.message != 'Not found') return next(err);
                if (!w_data) {
                    return next(new Errors.ArrangementNotExist("Temporary arrangement not exists!"));
                }
                req.models.working.remove({id: w_data[0]['id']}, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            });
    });
};

function check(req, cb) {
    var adminId=req.query.adminId || req.body.adminId;
    var doctorId=req.params.doctorId;
    req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') throw err;
        if(!admin) return cb(new Errors.InvalidAdminId('Admin id not exist'));
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id, doctor.price as price "+
            "FROM hospital, department, doctor "+
            "WHERE hospital.id=department.hospital_id "+
            "AND department.id=doctor.department_id "+
            "AND doctor.id=? LIMIT 1",
            [doctorId],
            function(err, data){
                if(err && err.message != 'Not found') return cb(err);
                if(!data) {
                    return cb(new Errors.AdminDoctorError("No Such Doctor!"));
                }
                if(data[0]['id']!=hospital_id){
                    return cb(new Errors.AdminAccessRejected("Invalid Access For This Administrator!"));
                }
                cb(err, data, doctorId, adminId);
            });
    });
}