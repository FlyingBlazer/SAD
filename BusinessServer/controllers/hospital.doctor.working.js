var Errors = require('../lib/errors');

exports.getRaw = function(req, res, next) {
    function getApp(working,day){
        switch(day){
            case 1:
                return working.monday;
                break;
            case 2:
                return working.tuesday;
                break;
            case 3:
                return working.wednesday;
                break;
            case 4:
                return working.thursday;
                break;
            case 5:
                return working.friday;
                break;
            case 6:
                return working.saturday;
                break;
            case 7:
                return working.sunday;
                break;
        }
    }
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var week_stat=[[0,0,0],[0,0,0],[0,0,0],
            [0,0,0],[0,0,0],[0,0,0],[0,0,0]];
        var temp_stat=[];
        req.models.working.find({doctor_id: doctorId}, function(err, workings) {
            if(err && err.message != 'Not found') throw err;
            workings.forEach(function(working){
                var curDate = new Date();
                var day=(curDate.getDay()+6)%7+1;
                switch(working.frequency.charAt(0)){
                    case '0':
                        var date = new Date(working.date);
                        if(date.Format('yyyyMMdd') < curDate.Format('yyyyMMdd')) break;
                        var temp_working={
                            date: date.Format('yyyy-MM-dd'),
                            period: working.period,
                            capacity: working.frequency.charAt(1)=='1'?  working.monday : 0
                        };
                        temp_stat.push(temp_working);
                        break;
                    case '2':
                        for(var i = 1 ; i <= 7 ; i++){
                            if(working.frequency.charAt(i)=='1'){
                                week_stat[i-1][working.period-1]=getApp(working, i);
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
        var new_working= req.body.week;
        var morning = '20000000';
        var afternoon = '20000000';
        var evening = '20000000';
        for(var i = 0 ; i < 7 ; i++) {
            morning = morning.replaceAt(i + 1, new_working[i][0]!=0 ? 1 : 0);
            afternoon = afternoon.replaceAt(i + 1, new_working[i][1]!=0 ? 1 : 0);
            evening = evening.replaceAt(i + 1, new_working[i][2]!=0 ? 1 : 0);
        }

        var date=new Date();
        req.models.working.get(doctorId, function(err, workings) {
            if(err && err.message != 'Not found') throw err;
            if(workings && workings.length > 0) {
                return next(new Errors.AddingFailed("Working Arrangement Already Exists!"));
            }
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 1,
                frequency: morning,
                price : data[0]['price'],
                monday : parseInt(new_working[0][0]),
                tuesday: parseInt(new_working[1][0]),
                wednesday: parseInt(new_working[2][0]),
                thursday: parseInt(new_working[3][0]),
                friday: parseInt(new_working[4][0]),
                saturday: parseInt(new_working[5][0]),
                sunday:parseInt(new_working[6][0])
            }, function(err, working) {
                if(err) throw err;
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 2,
                frequency: afternoon,
                price : data[0]['price'],
                monday : parseInt(new_working[0][1]),
                tuesday: parseInt(new_working[1][1]),
                wednesday: parseInt(new_working[2][1]),
                thursday: parseInt(new_working[3][1]),
                friday: parseInt(new_working[4][1]),
                saturday: parseInt(new_working[5][1]),
                sunday:parseInt(new_working[6][1])
            }, function(err, working) {
                if(err) throw err;
                finish();
            });
            req.models.working.create({
                doctor_id: doctorId,
                date: date.Format('yyyy-MM-dd'),
                period: 3,
                frequency: evening,
                price : data[0]['price'],
                monday : parseInt(new_working[0][2]),
                tuesday: parseInt(new_working[1][2]),
                wednesday: parseInt(new_working[2][2]),
                thursday: parseInt(new_working[3][2]),
                friday: parseInt(new_working[4][2]),
                saturday: parseInt(new_working[5][2]),
                sunday:parseInt(new_working[6][2])
            }, function(err, working) {
                if(err) throw err;
                finish();
            });
        });
    });
};

exports.updateWeek = function(req, res, next) {
    check(req, function(err, data, doctorId, adminId) {
        if(err) return next(err);
        var works=req.body.works;
        req.models.working.find({doctor_id: doctorId}, function(err, workings){
            if(err) throw err;
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
            function updateSpecific(working, day, number){
                switch(day){
                    case 1:
                        working.monday=number;
                        break;
                    case 2:
                        working.tuesday=number;
                        break;
                    case 3:
                        working.wednesday=number;
                        break;
                    case 4:
                        working.thusday=number;
                        break;
                    case 5:
                        working.friday=number;
                        break;
                    case 6:
                        working.saturday=number;
                        break;
                    case 7:
                        working.sunday=number;
                        break;
                }
            }
            //console.log(works);
            for(var i = 0 ; i < works.length ; i++){
                switch(parseInt(works[i]['period'],10)) {
                    case 1:
                        workings[m_index].frequency = workings[m_index].frequency.replaceAt(parseInt(works[i]['day']), works[i]['action']!=0 ? 1 : 0);
                        updateSpecific(workings[m_index],parseInt(works[i]['day']), works[i]['action']);
                        break;
                    case 2:
                        workings[a_index].frequency = workings[a_index].frequency.replaceAt(parseInt(works[i]['day']), works[i]['action']!=0 ? 1 : 0);
                        updateSpecific(workings[a_index], parseInt(works[i]['day']), works[i]['action']);
                        break;
                    case 3:
                        workings[e_index].frequency = workings[e_index].frequency.replaceAt(parseInt(works[i]['day']), works[i]['action']!=0 ? 1 : 0);
                        updateSpecific(workings[e_index], parseInt(works[i]['day']), works[i]['action']);
                        break;
                    default:
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
        var t_frequency = '0_000000';
        req.models.working.one({
            doctor_id: doctorId,
            frequency: t_frequency,
            period: t_period
        }, function (err, working) {
            if (err && err.message != 'Not found') throw err;
            if (working) {
                throw new Error.WorkingAlreadyExist("Working already Exists!");
            }
            t_frequency = t_frequency.replaceAt(1, t_action==0 ? 0 : 1);
            req.models.working.create({
                doctor_id: doctorId,
                date: req.body.date,
                frequency: t_frequency,
                period: t_period,
                monday: t_action,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            }, function (working) {
                if (err) throw err;
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
            "SELECT id FROM working WHERE doctor_id=? AND date=? AND period=? AND frequency LIKE ? LIMIT 1",
            [doctorId, w_date, w_period, '0_000000'],
            function (err, w_data) {
                if (err) throw err;
                if (!w_data || w_data.length==0) {
                    return next(new Errors.ArrangementNotExist("Temporary arrangement not exists!"));
                }
                req.db.driver.execQuery("DELETE FROM working WHERE id=?",
                    [w_data[0].id],
                    function (err) {
                        if(err) throw err;
                        res.json({
                            code: 0,
                            message: 'success'
                        });
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
                if(err && err.message != 'Not found') throw err;
                if(!data || data.length==0) {
                    return cb(new Errors.AdminDoctorError("No Such Doctor!"));
                }
                if(data[0]['id']!=hospital_id){
                    return cb(new Errors.AdminAccessRejected("Invalid Access For This Administrator!"));
                }
                cb(err, data, doctorId, adminId);
            });
    });
}