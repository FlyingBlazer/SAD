var Errors = require('../lib/Errors');

exports.list = function(req, res, next) {
    var user_id = req.body.user_id;
    req.db.driver.execQuery(
  		"SELECT appointment.id as reservation_id,appointment.time as time,doctor.name as doctor_name,hospital.name as hospital_name,department.name as department_name
  		 FROM appointment,doctor,department,hospital
  		 WHERE appointment.user_id=?
  		 AND appointment.doctor_id=doctor.id
  		 AND doctor.department_id=department.id
  		 AND department.hospital_id=hospital.id",
  		[user_id],
  		function (err, data) {
  			if(err) return next(err);
        	if(!data) {
            	return next(new Errors.EmptyReservation("You Don't Have Any Appointment!"));
        	}
        	else{
	  			res.json({
                	errcode: 0,
                	errmsg: 'success',
                	reservations: data
            	});
  			}
  		});
}; 

exports.add = function(req, res, next) {
    var auser_id=req.body.user_id;
    var apay_method=req.body.pay_method;
    var ahospital_id=req.body.hospital_id;
    var adepartment_id=req.body.department_id;
    var adoctor_id=req.body.doctor_id;
    var adate=req.body.date;
    var aweeknum=req.body.week;
    var aperiod=req.body.period;
    var acurrent=req.body.current;
    var afrequency1="00000000";
    var afrequency2="10000000";
    var afrequency3="2???????";
    var afrequency4="30000000";
    afrequency3[weeknum]='1';
    req.models.user.get(user_id,function(err,user){
    	if(err) return next(err);
    	if(!user) return next(new Errors.ReservationUserInvalidFailure('User Not Exist!'));
    	else{
    		req.db.driver.execQuery("SELECT COUNT(*) as number
    								 FROM appointment
    								 WHERE doctor_id=?
    								 AND period=?
    								 AND time=?",
    			[adoctor_id,aperiod,adate],
    			function(err,data){
    				if(err) return next(err);
    				if(!data) return next(new Errors.ReservationErrorFailure('Database Error!'));
					req.db.driver.execQuery("SELECT total_app
											 FROM working
											 WHERE doctor_id=?
											 AND period=?
											 AND (fequency=?
											 OR frequency=?
											 OR (frequency=? AND time=?)
											 OR frequency like '?')",
					[adoctor_id,aperiod,afequency1,afrequency2,afrequency4,adate,afrequency3]
					function(err,data1){
						if(err) return next(err);
						if(!data1) return next(new Errors.ReservationPeriodFailure('No Such Working Period!'));
						if(data1[0]['total_app']<=data['number']){
							return next(new Errors.ReservationFullFailure("Appointment Full!"));
						}
						else{
							req.models.appointment.create([{
								pay_method:apay_method,
								time:adate,
								period: aperiod,
								status: 0,
								price: aprice,
								running_number: ,
								record_time: acurrent,
								user: auser_id,
								doctor: adoctor_id
							}],function(error,items){
								res.json({
                					errcode: 0,
			                		errmsg: 'success'
            					});
							});
						}
					});
    			});
    	}
    });
};

exports.cancel = function(req, res, next) {
    var reservation_id=req.body.reservation_id;
    req.models.appointment.get(reservation_id,function(err,app){
    	if(err) return next(err);
    	if(!app) return next(new Errors.CancelFailure("Cannot Find Such Appointment!"));
    	else{
    		app.remove(function(err){
    			if(err) return next(err);
    			res.json({
                	errcode: 0,
			        errmsg: 'success'
            	});
    		});
    	}
    });
};

exports.pay = function(req, res, next) {
    var reservation_id=req.body.reservation_id;
    req.models.appointment.get(reservation_id,function(err,app){
    	if(err) return next(err);
    	if(!app) return next(new Errors.PaymentFailure("Unable To Pay For Your Appointment!"));
    	else{
    		app.status=1;
    		app.save(function(err){
    			if(err) return next(err);
    			res.json({
                	errcode: 0,
			        errmsg: 'success'
            	});
    		});
    	}
    });
};

exports.detail = function(req, res, next) {
    var reservation_id=req.body.reservation_id;
    req.db.driver.execQuery(
  		"SELECT 
  		 FROM appointment,doctor,department,hospital
  		 WHERE appointment.user_id=?
  		 AND appointment.doctor_id=doctor.id
  		 AND doctor.department_id=department.id
  		 AND department.hospital_id=hospital.id",
  		 [reservation_id],
  		 function(err,data){
  		 	if(err) return next(err);
  		 	if(!data) return next(new Errors.DetailFalure("No Such Appointment!"));
  		 	res.json({
  		 		errcode: 0,
  		 		errmsg: "success",
  		 		reservation_id: data[0]['reservation'],
  		 		runnint_number: data[0]['running_number'],
  		 		appointment_time: data[0]['time'],
  		 		doctor_name: data[0]['doctor_name'],
  		 		department_name: data[0]['department_name'],
  		 		hospital_name: data[0]['hospital_name'],
  		 		record_time: data[0]['record_time'],
  		 		price: data[0]['price'],
  		 		status: data[0]['status']
  		 	});
  		 });
};

exports.print = function(req, res, next) {
    var reservation_id=req.body.reservation_id;
    eq.db.driver.execQuery(
  		"SELECT 
  		 FROM appointment,doctor,department,hospital
  		 WHERE appointment.user_id=?
  		 AND appointment.doctor_id=doctor.id
  		 AND doctor.department_id=department.id
  		 AND department.hospital_id=hospital.id",
  		 [reservation_id],
  		 function(err,data){
  		 	if(err) return next(err);
  		 	if(!data) return next(new Errors.PrintFalure("No Such Appointment!"));
  		 	
  		 });
    ///<summary>
    ///TODO-实现打(qu)印(ta)功(miao)能(de)
    ///</summary>
};

exports.confirm = function(req, res, next) {
    var reservation_id=req.body.reservation_id;
    req.models.appointment.get(reservation_id,function(err,app){
    	if(err) return next(err);
  		if(!app) return next(new Errors.ConfirmFalure("No Such Appointment!"));
  		app.status=11;
  		app.save(function(err){
  			if(err) return next(err);
  			res.json({
  				errcode: 0,
  				errmsg: "success"
  			});
  		});
    })
};