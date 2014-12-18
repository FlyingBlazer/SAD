var Errors = require('../lib/Errors');
var uuid = require('node-uuid');

exports.list = function(req, res, next) {
    var user_id = req.query.userid;
    req.db.driver.execQuery(
  		"SELECT appointment.id as reservation_id, appointment.price as price,appointment.status as status, appointment.time as time,doctor.name as doctor_name,hospital.name as hospital_name,department.name as department_name "+
  		"FROM appointment,doctor,department,hospital "+
  		"WHERE appointment.user_id=? "+
  		"AND appointment.doctor_id=doctor.id "+
  		"AND doctor.department_id=department.id "+
  		"AND department.hospital_id=hospital.id",
  		[user_id],
  		function (err, data) {
			if(err && err.message != 'Not found') return next(err);
        	if(!data) {
            	return next(new Errors.EmptyReservation("You Don't Have Any Appointment!"));
        	}
        	else{
            var statuslist=[
                    '现金付款，尚未支付',
                    '现金付款，已支付',
                    '在线付款，尚未支付',
                    '在线付款，已支付',
                    '订单超时，尚未支付',
                    '订单超时，尚未确认就诊',
                    '订单超时，未就诊',
                    '订单超时，已就诊',
                    '订单超时，未就诊'
                ];
            for(var i = 0; i < data.length; i++){
                data[i]['status']=statuslist[data[i]['status']];
            }
	  			  res.json({
                	code: 0,
                	message: 'success',
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
    var aggdate='%'+adate.substr(5,5);
    var aweeknum=req.body.week;
    var aperiod=req.body.time == 'morning' ? 1 : (req.body.time == 'afternoon' ? 2 : 3);
    var afrequency1="00000000";
    var afrequency2="10000000";
    var afrequency3="2_______";
    var afrequency4="30000000";
    var weeknum=aweeknum == '星期一' ? 1: (aweeknum == '星期二' ? 2: (aweeknum == '星期三' ? 3: (aweeknum == '星期四' ? 4: (aweeknum == '星期五' ? 5: (aweeknum == '星期六' ? 6: 7)))));
    afrequency3 = afrequency3.replaceAt(weeknum, '1');
    req.models.user.get(auser_id,function(err,user){
		if(err && err.message != 'Not found') return next(err);
    	if(!user) return next(new Errors.ReservationUserInvalidFailure('User Not Exist!'));
    	else{
    		req.db.driver.execQuery("SELECT COUNT(*) as number "+
    								"FROM appointment "+
    								"WHERE doctor_id=? "+
    								"AND period=? "+
    								"AND time=?",
    			[adoctor_id,aperiod,adate],
    			function(err,data){
    				if(err) return next(err);
    				if(!data) return next(new Errors.ReservationErrorFailure('Database Error!'));
					req.db.driver.execQuery("SELECT total_app,price"+
											"FROM working,doctor"+
                      "WHERE doctor_id=doctor.id"+
											"AND doctor_id=? "+
											"AND period=? "+
											"AND (frequency=? "+
											"OR frequency=? "+
											"OR (frequency=? AND date like '?') "+
											"OR frequency like '?') LIMIT 1",
					[adoctor_id,aperiod,afrequency1,afrequency2,afrequency4,aggdate,afrequency3],
					function(err,data1){
						if(err && err.message != 'Not found') return next(err);
						if(!data1) return next(new Errors.ReservationPeriodFailure('No Such Working Period!'));
						if(data1[0]['total_app']<=data['number']){
							return next(new Errors.ReservationFullFailure("Appointment Full!"));
						}
						else{
							req.models.appointment.create({
								pay_method:apay_method,
								time:adate,
								period: aperiod,
								status: 0,
								price: data1[0]['price'],
								running_number: uuid.v4(),
								user: auser_id,
								doctor: adoctor_id
							},function(error,item){
								res.json({
                					code: 0,
			                		message: 'success',
									id: item.id
            					});
							});
						}
					});
    			});
    	}
    });
};

exports.cancel = function(req, res, next) {
    var reservation_id=req.params.reservationId;
    req.models.appointment.get(reservation_id,function(err,app){
		if(err && err.message != 'Not found') return next(err);
    	if(!app) return next(new Errors.CancelFailure("Cannot Find Such Appointment!"));
    	else{
    		app.remove(function(err){
				if(err && err.message != 'Not found') return next(err);
    			res.json({
                	code: 0,
			        message: 'success'
            	});
    		});
    	}
    });
};

exports.pay = function(req, res, next) {
    var reservation_id=req.params.reservationId;
    req.models.appointment.get(reservation_id,function(err,app){
		if(err && err.message != 'Not found') return next(err);
    	if(!app) return next(new Errors.PaymentFailure("Unable To Pay For Your Appointment!"));
    	else{
    		app.status=1;
    		app.save(function(err){
				if(err && err.message != 'Not found') return next(err);
    			res.json({
                	code: 0,
			        message: 'success'
            	});
    		});
    	}
    });
};

exports.detail = function(req, res, next) {
    var reservation_id=req.params.reservationId;
    req.db.driver.execQuery(
		"SELECT appointment.id AS reservation,appointment.time AS time,status,appointment.price AS price,record_time,"+
		"period,doctor.name as doctor_name,department.name as department_name,hospital.name as hospital_name "+
		"FROM appointment,doctor,department,hospital "+
		"WHERE appointment.id=? "+
		"AND appointment.doctor_id=doctor.id "+
		"AND doctor.department_id=department.id "+
		"AND department.hospital_id=hospital.id",
  		 [reservation_id],
  		 function(err,data){
			 if(err && err.message != 'Not found') return next(err);
  		 	if(!data) return next(new Errors.DetailFailure("No Such Appointment!"));
       var statuslist=[
                    '现金付款，尚未支付',
                    '现金付款，已支付',
                    '在线付款，尚未支付',
                    '在线付款，已支付',
                    '订单超时，尚未支付',
                    '订单超时，尚未确认就诊',
                    '订单超时，未就诊',
                    '订单超时，已就诊',
                    '订单超时，未就诊'
                ];
  		 	res.json({
  		 		code: 0,
  		 		message: "success",
  		 		reservation_id: data[0]['reservation'],
				  date: data[0]['time'],
				  period: data[0]['period']==1 ? 'morning' : (data[0]['period']==2 ? 'afternoon' : 'evening'),
  		 		doctor_name: data[0]['doctor_name'],
  		 		department_name: data[0]['department_name'],
  		 		hospital_name: data[0]['hospital_name'],
				  submission_date: data[0]['record_time'],
  		 		price: data[0]['price'],
  		 		status: statuslist[data[0]['status']]
  		 	});
  		 });
};

exports.confirm = function(req, res, next) {
    var reservation_id=req.params.reservationId;
    req.models.appointment.get(reservation_id,function(err,app){
		if(err && err.message != 'Not found') return next(err);
  		if(!app) return next(new Errors.ConfirmFalure("No Such Appointment!"));
  		app.status=11;
  		app.save(function(err){
			if(err && err.message != 'Not found') return next(err);
  			res.json({
  				code: 0,
  				message: "success"
  			});
  		});
    })
};