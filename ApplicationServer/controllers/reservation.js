/**
 * Created by renfei on 14/12/6.
 */

// util

function fireRequest(method, path, data, callback) {
    var options = {
        host: 'localhost',
        method: method,
        path: path
    };
    var http = require('http');
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            callback(JSON.parse(chunk));
        });
    });
    if (data !== null)
        req.write(data);
    req.end();
}

Date.prototype.yymmdd = function() {
    var yy = this.getFullYear().toString().substr(2, 2);
    var mm = (this.getMonth() + 1).toString();
    var dd  = this.getDate().toString();
    return yy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
};

// Choose a location
// No view, just set cookie and redirect to home page
// get
exports.chooseLocation = function(request, response) {
    var username = request.cookies.username;
    var province = request.query.province;
    response.cookie('province', province, {
        maxAge: 999999,
        httpOnly: true
    });
    response.redirect(302, '/hospitals');
};

// List hospitals - Show a list of all hospitals in user's city
// Choose a hospital
// get
exports.redirectToListHospitals = function(request, response) {
    if (typeof request.cookies.province !== 'undefined') {
        var province = request.cookies.province;
        response.redirect(302, '/' + province + '/hospitals');
    } else {
        response.redirect(302, '/beijing/hospitals');
    }
};

// get
exports.listHospitals = function(request, response) {
    var username = request.cookies.username;
    var province = request.params.province;
    var url = '/hospital/hospital/list?province=' + province;

    fireRequest('GET', url, null, function(res) {
        response.render('hospital_list', {
            username: username,
            // TODO: search ??!!?!?!
            search: false,
            list: res.hospitals
        });
    });
};

// Hospital page - Show all departments and doctors
// Choose a department and a doctor
// get
exports.showHospital = function(request, response) {
    var username = request.cookies.username;
    var hospitalId = request.params.hospital_id;
    var detail = null;
    var departments = null;
    var doctors = null;

    var url1 = '/hospital/hospital/' + hospitalId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        detail = res;
        onCompletion();
    });

    var url2 = '/hospital/department/' + hospitalId;
    fireRequest('GET', url2, null, function(res) {
        departments = res.departments_list;
        onCompletion();
    });

    var url3 = '/hospital/doctor/list?hospitalId=' + hospitalId;
    fireRequest('GET', url3, null, function(res) {
        doctors = res.doctors;
        onCompletion();
    });

    var onCompletion = function() {
        if (detail == null || departments == null || doctors == null)
            return;
        response.render('hospital', {
            username: username,
            detail: detail,
            departments: departments,
            doctors: doctors
        });
    }
};

// (!) deprecated method
exports.showHospital2 = function(request, response) {
    var username = request.cookies.username;
    var hospitalId = request.params.hospital_id;
    var detail = null;
    var departments = null;
    var doctors = '{';

    var url1 = '/hospital/hospital/' + hospitalId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        detail = res;
        getDoctors();
    });

    var url2 = '/hospital/department/' + hospitalId;
    fireRequest('GET', url2, null, function(res) {
        departments = res;
        getDoctors();
    });

    var url3 = '/hospital/doctor/list?departmentId=';
    var getDoctors = function() {
        if (detail == null || departments == null)
            return;

        var ix = 0;
        var url4 = url3 + departments.departments_list[i].id;

        var completeReqSeq = function() {
            doctors += '}';
            response.render('hospital', {
                username: username,
                detail: res,
                departments: departments.departments_list,
                doctors: JSON.parse(doctors)
            });
        };

        var handleRes = function(res) {
            doctors += '"department_' + ix + '": [';
            doctors += JSON.stringify(res.doctors);
            doctors += ']';
            ++ix;
            if (ix < departments.count) {
                doctors += ',';
                url4 = url3 +  departments.departments_list[i].id;
                fireRequest('GET', url4, null, handleRes);
            } else {
                completeReqSeq();
            }
        };

        fireRequest('GET', url4, null, handleRes);
    };
};

// Doctor page - Show doctor's detail and available time slots
// Choose a time
// get
exports.showDoctor = function(request, response) {
    var username = request.cookies.username;
    var expertId = request.params.expert_id;
    var hospitalId = request.params.hospital_id;
    var departmentId = request.params.department_id;
    var url = '/hospital/doctor/' + expertId + '/detail';

    fireRequest('GET', url, null, function(res) {
        response.render('doctor', {
            username: username,
            hospitalId: hospitalId,
            departmentId: departmentId,
            detail: res
        });
    });
};

// post (need x-www-form-urlencoded data)
exports.confirm = function(request, response) {
    var username = request.cookies.username;
    var userId = request.cookies.userId;
    var userTelephone = request.cookies.userTelephone;
    var userSocialId = request.cookies.userSocialId;
    var userRealName = request.cookies.userRealName;
    // information below are from _post
    var hospital = request.body.hospital;
    var hospitalId = request.body.hospitalId;
    var department = request.body.department;
    var departmentId = request.body.departmentId;
    var doctor = request.body.doctor;
    var doctorId = request.body.doctorId;
    var resvDate = request.body.resvDate;
    var resvTime = request.body.resvTime;
    var title = request.body.title;
    var price = request.body.price;

    response.render('new_reservation', {
        detail: {
            "username": username,
            "userId": userId,
            "hospital": hospital,
            "hospitalId": hospitalId,
            "department": department,
            "departmentId": departmentId,
            "doctor": doctor,
            "doctorId": doctorId,
            "doctorTitle": title,
            "date": resvDate,
            "time": resvTime,
            "price": price,
            "userTelephone": userTelephone,
            "userSocialId": userSocialId,
            "userRealName": userRealName
        }
    });
};

// Submit request
// post (need x-www-form-urlencoded data)
exports.onSubmit = function(request, response) {
    var userId = request.cookies.userId; // from cookie;
    var hospitalId = request.body.hospitalId; // from prev page
    var departmentId = request.body.departmentId; // from prev page
    var doctorId = request.body.doctorId; // from prev page
    var time = request.body.resvTime; // from prev page
    var date = request.body.resvDate; // from prev page

    var url = '/user/reservation/add';
    var data = {
        user_id: userId,
        hospital_id: hospitalId,
        department_id: departmentId,
        doctor_id: doctorId,
        date: date,
        time: time,
        paid_flag: false
    };
    fireRequest('POST', url, JSON.stringify(data), function(res) {
        var resvId = res.id;
        response.redirect(302, '/reservation/' + doctorId + '/' + resvId + '?state=success');
    });
};

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
// get
exports.showReservation = function(request, response) {
    var username = request.cookies.username;
    var resvId = request.params.reservation_id;
    var doctorId = request.params.doctor_id;
    var userRealName = request.cookies.userRealName;
    var userTel = request.cookies.userTelephone;
    var userSid = request.cookies.userSocialId;
    var state = 'normal';
    var doctorDetail = null;
    var resvDetail = null;
    if (typeof request.query.state != 'undefined') {
        state = request.query.state;
    }
    var url1 = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        resvDetail = res;
        render();
    });

    var url2 = '/hospital/doctor/' + doctorId + '/detail';
    fireRequest('GET', url2, null, function(res) {
        doctorDetail = res;
        render();
    });

    var render = function() {
        if (resvDetail == null || doctorDetail == null)
            return;

        response.render('reservation', {
            username: username,
            state: state,
            userRealName: userRealName,
            userTelephone: userTel,
            userSocialId: userSid,
            resvDetail: resvDetail,
            doctorDetail: doctorDetail
        });
    }
};

// post
exports.operateReservation = function(request, response) {
    var username = request.cookies.username;
};