var Errors = require('../lib/errors');

exports.getRaw = function(req, res, next) {
    check(req, function(data, doctorId, adminId) {
        var week_stat=[[0,0,0],[0,0,0],[0,0,0],
            [0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        var temp_stat=[];
        req.models.working.find({doctor_id: doctorId}, function(err, workings) {
            if(err && err.message != 'Not found') return next(err);
            workings.forEach(function(working){
                switch(working.frequency.charAt(0)){
                    case '0':
                        var temp_working={
                            date: working.date,
                            period: working.period,
                            isWorking: working.frequency.charAt(1)=='1'
                        };
                        temp_stat.push(temp_working);
                        break;
                    case '2':
                        for(var i = 1 ; i <= 7 ; i++){
                            if(working.frequency.charAt(i)=='1'){
                                week_stat[i-1][working.period-1]=1;
                            }
                        }
                        break;
                }
            });
            res.json({
                code: 0,
                message: 'success'
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
    check(req, function(data, doctorId, adminId) {
        var new_working=req.body.day;
        var morning = '20000000';
        var afternoon = '20000000';
        var evening = '20000000';
        for(var i = 0 ; i < 7 ; i++) {
            morning.replaceAt(i + 1, new_working[i][0]);
            afternoon.replaceAt(i + 1, new_working[i][1]);
            evening.replaceAt(i + 1, new_working[i][2]);
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
                price : data[0]['price']
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 2,
                frequency: afternoon,
                price : data[0]['price']
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 3,
                frequency: evening,
                price : data[0]['price']
            }, function(err, working) {
                if(err && err.message != 'Not found') return next(err);
                finish();
            });
        });
    });
};

exports.updateWeek = function(req, res, next) {
    check(req, function(data, doctorId, adminId) {
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
                        workings[m_index].frequency.replaceAt(works[i]['day'], works[i]['action']);
                        break;
                    case 1:
                        workings[a_index].frequency.replaceAt(works[i]['day'], works[i]['action']);
                        break;
                    case 2:
                        workings[e_index].frequency.replaceAt(works[i]['day'], works[i]['action']);
                        break;
                }
            }
            works.save(function(err) {
                if(err) throw err;
                res.json({
                    code: 0,
                    message: 'success'
                });
            });
        });
    });
};

exports.addTemp = function(req, res, next) {
    check(req, function(data, doctorId, adminId) {
        var t_period = req.body.period;
        var t_action = req.body.action;
        var t_frequency = '00000000';
        frequency.replaceAt(1, t_action);
        req.models.working.one({
            doctor_id: doctorId,
            frequency: t_frequency,
            period: t_period
        }, function (err, working) {
            if (err && err.message != 'Not found') return next(err);
            if (working) {
                throw new Error.WorkingAlreadyExist("Working already Exists!");
            }
            req.models.working.create({
                doctor_id: doctorId,
                frequency: t_frequency,
                period: t_period,
                total_app: data[0]['total_app']
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
    check(req, function(data, doctorId, adminId) {
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
    var adminId=req.body.adminId;
    var doctorId=req.body.doctorId;
    req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') return next(err);
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id, doctor.price as price "+
            "FROM hospital, department, doctor "+
            "WHERE hospital.id=department.hospital_id "+
            "AND department.id=doctor.department_id "+
            "AND doctor.id=? LIMIT 1",
            [doctorId],
            function(err, data){
                if(err && err.message != 'Not found') return next(err);
                if(!data) {
                    return next(new Errors.AdminDoctorError("No Such Doctor!"));
                }
                if(data[0]['id']!=hospital_id){
                    return next(new Errors.AdminAccessRejected("Invalid Access For This Administrator!"));
                }
                cb(data, doctorId, adminId);
            });
    });
}