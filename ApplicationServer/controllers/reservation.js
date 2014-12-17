/**
 * Created by renfei on 14/12/6.
 */

// util

var settings = require('../../settings.json');

var __logError = function(errMsg) {
    console.error('(!) # FATAL ERROR #');
    console.error(errMsg);
};

var __fatal = function(response) {
    response.status(503).send('HTTP/1.1 Error 503 Service Unavailable');
    __logError('Invalid object received from Business server (if it exists).');
};

var __invalidArgs = function(response) {
    response.status(418).send('HTTP/1.1 Error 418 I\'m a teapot');
    __logError('Invalid arguments provided.');
};

var __checkVars = function(name, object, members) {
    var status = true;
    for (var i = 2; i < arguments.length; ++i) {
        if (typeof object[arguments[i]] === 'undefined') {
            console.error('Argument not found: ' + name + '.' + arguments[i]);
            status = false;
        }
    }

    return status;
};

var fireRequest = function(method, path, data, callback) {
    var options = {
        host: 'localhost',
        port: settings.port.business,
        method: method,
        path: path
    };
    var http = require('http');
    var responseData = '';
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            responseData += chunk;
        });
        res.on('end', function() {
            var srcObject = null;
            try {
                srcObject = JSON.parse(responseData);
            } catch (e) {
                __logError('Cannot parse response data.');
                //console.error(e);
            }
            callback(srcObject);
        });
    });
    req.on('error', function(e) {
        __logError('Business server is DOWN: ' + e.message);
        callback(null);
    });
    if (data !== null)
        req.write(data);
    req.end();
};

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
    if (typeof request.query.province !== 'undefined') {
        var province = request.query.province;
        response.cookie('province', province, {
            maxAge: 999999,
            httpOnly: true
        });
        response.redirect(302, '/hospitals');
    } else {
        response.redirect(302, '/');
    }
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
    //if (!__checkVars('cookies', request.cookies, 'username')) {
    //    __invalidArgs(response);
    //    return;
    //}

    var username = request.cookies.username ? request.cookies.username : '';
    var province = request.params.province;
    var url = '/hospital/hospital/list?province=' + province;

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatal(response);
            return;
        }
        response.render('hospital_list', {
            username: username,
            search: false,
            searchText: null,
            list: res.hospitals
        });
    });
};

// get
exports.search = function(request, response) {
    //if (!__checkVars('cookies', request.cookies, 'username')) {
    //    __invalidArgs(response);
    //    return;
    //}

    var username = request.cookies.username ? request.cookies.username : '';
    var query = request.query.q;
    var url = '/search?q=' + query;

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatal(response);
            return;
        }
        response.render('hospital_list', {
            username: username,
            search: true,
            searchText: query,
            list: res.hospitals
        });
    });
};

// Hospital page - Show all departments and doctors
// Choose a department and a doctor
// get
exports.showHospital = function(request, response) {
    //if (!__checkVars('cookies', request.cookies, 'username')) {
    //    __invalidArgs(response);
    //    return;
    //}

    var username = request.cookies.username ? request.cookies.username : '';
    var hospitalId = request.params.hospital_id;
    var detail = null;
    var departments = null;
    var doctors = null;
    var ctr = 0;

    var url1 = '/hospital/hospital/' + hospitalId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        detail = res;
        ++ctr;
        onCompletion();
    });

    var url2 = '/hospital/department/' + hospitalId;
    fireRequest('GET', url2, null, function(res) {
        departments = typeof res.departments_list === 'undefined' ? null : res.departments_list;
        ++ctr;
        onCompletion();
    });

    var url3 = '/hospital/doctor/list?hospitalId=' + hospitalId;
    fireRequest('GET', url3, null, function(res) {
        doctors = typeof res.doctors === 'undefined' ? null : res.doctors;
        ++ctr;
        onCompletion();
    });

    var onCompletion = function() {
        if (ctr !== 3)
            return;
        if (detail == null || departments == null || doctors == null) {
            __fatal(response);
            return;
        }
        response.render('hospital', {
            username: username,
            detail: detail,
            departments: departments,
            doctors: doctors
        });
    }
};

// Doctor page - Show doctor's detail and available time slots
// Choose a time
// get
exports.showDoctor = function(request, response) {
    //if (!__checkVars('cookies', request.cookies, 'username')) {
    //    __invalidArgs(response);
    //    return;
    //}

    var username = request.cookies.username ? request.cookies.username : '';
    var expertId = request.params.expert_id;
    var hospitalId = request.params.hospital_id;
    var departmentId = request.params.department_id;
    var url = '/hospital/doctor/' + expertId + '/detail';

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatal(response);
            return;
        }
        response.render('doctor', {
            username: username,
            hospitalId: hospitalId,
            departmentId: departmentId,
            detail: res
        });
    });
};

// get
exports.recoverConfirm = function(request, response) {

    // check required cookies
    if (!__checkVars('cookies', request.cookies, 'confirm_data', 'username', 'userId', 'userTelephone', 'userSocialId', 'userRealName')) {
        // still not logged in
        response.clearCookie('confirm_data');
        __invalidArgs(response);
        return;
    } else {
        var bodyParams = JSON.parse(request.cookie.confirm_data);
        response.clearCookie('confirm_data');
    }

    var username = request.cookies.username;
    var userId = request.cookies.userId;
    var userTelephone = request.cookies.userTelephone;
    var userSocialId = request.cookies.userSocialId;
    var userRealName = request.cookies.userRealName;

    response.render('new_reservation', {
        detail: {
            "username": username,
            "userId": userId,
            "userTelephone": userTelephone,
            "userSocialId": userSocialId,
            "userRealName": userRealName,
            "hospital": bodyParams.hospital,
            "hospitalId": bodyParams.hospitalId,
            "department": bodyParams.department,
            "departmentId": bodyParams.departmentId,
            "doctor": bodyParams.doctor,
            "doctorId": bodyParams.doctorId,
            "doctorTitle": bodyParams.title,
            "date": bodyParams.resvDate,
            "time": bodyParams.resvTime,
            "price": bodyParams.price
        }
    });
};

// post (need x-www-form-urlencoded data)
exports.confirm = function(request, response) {

    // if request body is incorrect, reject the request
    if (!__checkVars('body', request.body, 'hospital', 'hospitalId', 'department', 'departmentId', 'doctor', 'doctorId', 'resvDate', 'resvTime', 'title', 'price')) {
        __invalidArgs(response);
        return;
    }

    var bodyParams = {
        'hospital': request.body.hospital,
        'hospitalId': request.body.hospitalId,
        'department': request.body.department,
        'departmentId': request.body.departmentId,
        'doctor': request.body.doctor,
        'doctorId': request.body.doctorId,
        'resvDate': request.body.resvDate,
        'resvTime': request.body.resvTime,
        'title': request.body.title,
        'price': request.body.price
    };

    // if cookie is not set, save request body to cookie and retreat to login page
    // otherwise clear potentially existent request body cookie
    if (!__checkVars('cookies', request.cookies, 'username', 'userId', 'userTelephone', 'userSocialId', 'userRealName')) {
        response.cookie('confirm_data', JSON.stringify(bodyParams), {
            maxAge: 999999,
            httpOnly: true
        });
        response.redirect(302, '/account/login');
        return;
    } else {
        response.clearCookie('confirm_data');
    }

    // if control reaches here, start the normal rendering process
    var username = request.cookies.username;
    var userId = request.cookies.userId;
    var userTelephone = request.cookies.userTelephone;
    var userSocialId = request.cookies.userSocialId;
    var userRealName = request.cookies.userRealName;

    response.render('new_reservation', {
        detail: {
            "username": username,
            "userId": userId,
            "userTelephone": userTelephone,
            "userSocialId": userSocialId,
            "userRealName": userRealName,
            "hospital": bodyParams.hospital,
            "hospitalId": bodyParams.hospitalId,
            "department": bodyParams.department,
            "departmentId": bodyParams.departmentId,
            "doctor": bodyParams.doctor,
            "doctorId": bodyParams.doctorId,
            "doctorTitle": bodyParams.title,
            "date": bodyParams.resvDate,
            "time": bodyParams.resvTime,
            "price": bodyParams.price
        }
    });
};

// Submit request
// post (need x-www-form-urlencoded data)
exports.onSubmit = function(request, response) {
    var _sa = __checkVars('cookies', request.cookies, 'userId');
    var _sb = __checkVars('body', request.body, 'hospitalId', 'departmentId', 'doctorId', 'resvTime', 'resvDate');

    if (_sa === false || _sb === false) {
        __invalidArgs(response);
        return;
    }

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
        if (res == null) {
            __fatal(response);
            return;
        }
        var resvId = res.id;
        response.redirect(302, '/reservation/' + doctorId + '/' + resvId + '?state=success');
    });
};

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
// get
exports.showReservation = function(request, response) {
    if (!__checkVars('cookies', request.cookies, 'username', 'userRealName', 'userTelephone')) {
        __invalidArgs(response);
        return;
    }

    var username = request.cookies.username;
    var resvId = request.params.reservation_id;
    var doctorId = request.params.doctor_id;
    var userRealName = request.cookies.userRealName;
    var userTel = request.cookies.userTelephone;
    var userSid = request.cookies.userSocialId;
    var state = 'normal';
    var doctorDetail = null;
    var resvDetail = null;
    var ctr = 0;
    if (typeof request.query.state != 'undefined') {
        state = request.query.state;
    }
    var url1 = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        resvDetail = res;
        ++ctr;
        render();
    });

    var url2 = '/hospital/doctor/' + doctorId + '/detail';
    fireRequest('GET', url2, null, function(res) {
        doctorDetail = res;
        ++ctr;
        render();
    });

    var render = function() {
        if (ctr !== 2)
            return;
        if (resvDetail == null || doctorDetail == null) {
            __fatal(response);
            return;
        }

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

// test
exports.test = function(request, response) {
    var file;
    if (request.params.template == 'new_reservation')
        file = '/new_reservation.json';
    else if (request.params.template == 'hospital')
        file = '/hospital.json';
    else if (request.params.template == 'doctor')
        file = '/doctor.json';
    else
        file = '/testfile.json';

    fireRequest('GET', file, null, function(res) {
        if (res == null) {
            __fatal(response);
            return;
        }
        response.render(request.params.template, res);
    });
};