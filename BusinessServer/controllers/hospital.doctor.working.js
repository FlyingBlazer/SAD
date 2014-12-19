var Errors = require('../lib/errors');

exports.getRaw = function(req, res, next) {
	var adminId=req.body.adminId;
	var doctorId=req.params.doctorId;
	req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') return next(err);
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id "+
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
                                        week_stat[i-1][working.period]=1;
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
    });
};

exports.addWeek = function(req, res, next) {
    var adminId=req.body.adminId;
    var doctorId=req.params.doctorId;
    var new_working=req.body.day;
    var morning = '20000000';
    var afternoon = '20000000';
    var evening = '20000000';
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
                for(var i = 0 ; i < 7 ; i++) {
                    morning.replaceAt(i + 1, new_working[i][0]==0 ? 0 : 1);
                    afternoon.replaceAt(i + 1, new_working[i][1]==0 ? 0 : 1);
                    evening.replaceAt(i + 1, new_working[i][2]==0 ? 0 : 1);
                }
                var date=new Date();
                req.models.working.find({doctor_id: doctorId}, function(err, workings) {
                    if(err && err.message != 'Not found') return next(err);
                    if(data) {
                        return next(new Errors.AddingFailed("Working Arrangement Already Exists!"));
                    }
                });

            });
    });
    //
};

exports.updateWeek = function(req, res, next) {
    var adminId=req.body.adminId;
    var doctorId=req.body.doctorId;
    req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') return next(err);
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id "+
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
                req.models.working.create({
                    doctor_id: doctorId,
                    date: date.Format('yyyy-MM-dd'),
                    period: 1,
                    frequency: morning,
                    price : data[0]['price']
                }, function(err, working) {
                    if(err && err.message != 'Not found') return next(err);
                });
                req.models.working.create({
                    doctor_id: doctorId,
                    date: date.Format('yyyy-MM-dd'),
                    period: 2,
                    frequency: afternoon,
                    price : data[0]['price']
                }, function(err, working) {
                    if(err && err.message != 'Not found') return next(err);
                });
                req.models.working.create({
                    doctor_id: doctorId,
                    date: date.Format('yyyy-MM-dd'),
                    period: 3,
                    frequency: evening,
                    price : data[0]['price']
                }, function(err, working) {
                    if(err && err.message != 'Not found') return next(err);
                });
                res.json({
                    code: 0,
                    message: 'success'
                });
            });
    });
    //
};

exports.addTemp = function(req, res, next) {
    var adminId=req.body.adminId;
    var doctorId=req.body.doctorId;
    req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') return next(err);
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id "+
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

            });
    });
    //
};

exports.deleteTemp = function(req, res, next) {
    var adminId=req.body.adminId;
    var doctorId=req.body.doctorId;
    req.models.administrator.get(adminId, function(err, admin) {
        if(err && err.message != 'Not found') return next(err);
        var hospital_id=parseInt(admin.name.substr(5, 8), 10);
        req.db.driver.execQuery(
            "SELECT hospital.id as id "+
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

            });
    });
    //
};