/**
 * Created by renfei on 14/12/6.
 */

// util

var settings = require('../../settings.json');
var stdNotFound = {};

Object.defineProperty(global, '__stack', {
    get: function() {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function() {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function() {
        return __stack[1].getFunctionName();
    }
});

var logError = function(errMsg) {
    console.error('(!) # FATAL ERROR # ...');
    for (var i = 0; i < arguments.length; ++i) {
        console.error(arguments[i]);
    }
};

var parseUserInfo = function(request) {
    return JSON.parse(new Buffer(request.cookies.userInfo, 'base64').toString('ascii'));
};

var checkVars = function(name, object, members) {
    var status = true;
    for (var i = 2; i < arguments.length; ++i) {
        if (typeof object[arguments[i]] === 'undefined') {
            console.error('Argument not found: ' + name + '.' + arguments[i]);
            status = false;
        }
    }

    return status;
};

var __fatalError = function(response, identifier) {
    response.status(503).send('HTTP/1.1 Error 503 Service Unavailable');
    logError('Incorrect content received from Business server (if it exists). Identifier: ' + identifier,
        'Terminating...');
};

var __entityNotFound = function(response, identifier) {
    response.status(200).send('Entity Not Found');
    console.error('Entity Not Found: ' + identifier);
};

var __invalidArgsError = function(response) {
    response.status(418).send('HTTP/1.1 Error 418 I\'m a teapot');
    logError('Invalid arguments provided.');
};

var serialize = function(obj) {
    var str = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
};

var fireRequest = function(method, path, data, callback, noErrCodeCheck) {
    var options;
    if (method == 'POST')
        options = {
            host: 'localhost',
            port: settings.port.business,
            method: method,
            path: path,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
    else
        options = {
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

            // check if the response data is parsable
            try {
                srcObject = JSON.parse(responseData);
            } catch (e) {
                logError('Cannot parse response data.',
                    'Request URL: ' + path,
                    'Server raw response: ' + responseData);
                callback(null);
            }

            // check response error code
            if (srcObject) {
                if (noErrCodeCheck || srcObject.code == 0) {
                    callback(srcObject);
                } else if (srcObject.code == 2001
                    || srcObject.code == 2101
                    || srcObject.code == 2201) {
                    callback(stdNotFound);
                } else {
                    logError('Unsuccessful response returned from business server, error not processed.',
                        ' > Request URL: ' + path,
                        ' > Server response: ' + responseData);
                    callback(null);
                }
            }
        });
    });

    req.on('error', function(e) {
        logError('Business server is DOWN: ' + e.message,
            ' > When requesting: ' + path);
        callback(null);
    });

    if (data !== null)
        req.write(data);

    req.end();
};

// Choose a location
// No view, just set cookie and redirect to home page
// get
exports.chooseLocation = function(request, response) {
    if (typeof request.params.province !== 'undefined') {
        var province = request.params.province;
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
    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);

    var username = userInfo.username ? userInfo.username : '';
    var province = request.params.province;
    var url = '/hospital/hospital/list?province=' + province;

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        if (res == stdNotFound) {
            __entityNotFound(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('hospital_list', {
            username: username,
            search: false,
            searchText: null,
            province: province,
            list: res.hospitals
        });
    }, false);
};

// get
exports.search = function(request, response) {
    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);

    var username = userInfo.username ? userInfo.username : '';
    var query = request.params.q;
    var url = '/search?q=' + query;

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('hospital_list', {
            username: username,
            search: true,
            searchText: query,
            list: res.hospitals
        });
    }, false);
};

// Hospital page - Show all departments and doctors
// Choose a department and a doctor
// get
exports.showHospital = function(request, response) {
    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);

    var username = userInfo.username ? userInfo.username : '';
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
    }, false);

    var url2 = '/hospital/department/' + hospitalId;
    fireRequest('GET', url2, null, function(res) {
        departments = res;
        ++ctr;
        onCompletion();
    }, false);

    var url3 = '/hospital/doctor/list?hospitalId=' + hospitalId;
    fireRequest('GET', url3, null, function(res) {
        doctors = res;
        ++ctr;
        onCompletion();
    }, false);

    var onCompletion = function() {
        if (ctr !== 3)
            return;
        if (detail == null || departments == null || doctors == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        if (detail == stdNotFound || departments == stdNotFound || doctors == stdNotFound) {
            __entityNotFound(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('hospital', {
            username: username,
            detail: detail,
            departments: departments.departments_list,
            doctors: doctors.doctors
        });
    }
};

// Doctor page - Show doctor's detail and available time slots
// Choose a time
// get
exports.showDoctor = function(request, response) {
    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);

    var username = userInfo.username ? userInfo.username : '';
    var expertId = request.params.expert_id;
    var hospitalId = request.params.hospital_id;
    var departmentId = request.params.department_id;
    var url = '/hospital/doctor/' + expertId + '/detail';

    fireRequest('GET', url, null, function(res) {
        if (res == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        if (res == stdNotFound) {
            __entityNotFound(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('doctor', {
            username: username,
            hospitalId: hospitalId,
            departmentId: departmentId,
            detail: res
        });
    }, false);
};

// get
exports.recoverConfirm = function(request, response) {
    // check required cookies
    if (!checkVars('cookies', request.cookies, 'confirm_data', 'userInfo')) {
        // still not logged in
        response.clearCookie('confirm_data');
        __invalidArgsError(response);
        return;
    } else {
        var bodyParams = JSON.parse(request.cookie.confirm_data);
        response.clearCookie('confirm_data');
    }

    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);

    var username = userInfo.username ? userInfo.username : '';
    var userId = userInfo.userId;
    var userTelephone = userInfo.phone;
    var userSocialId = userInfo.sid;
    var userRealName = userInfo.name;

    response.render('new_reservation', {
        username: username,
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
            "price": bodyParams.price,
            "day": bodyParams.day
        }
    });
};

// post (need x-www-form-urlencoded data)
exports.confirm = function(request, response) {

    // if request body is incorrect, reject the request
    if (!checkVars('body', request.body, 'hospital', 'hospitalId', 'department', 'departmentId', 'doctor', 'doctorId', 'resvDate', 'resvTime', 'title', 'price')) {
        __invalidArgsError(response);
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
        'price': request.body.price,
        'day': request.body.day
    };

    // if cookie is not set, save request body to cookie and retreat to login page
    // otherwise clear potentially existent request body cookie
    if (!checkVars('cookies', request.cookies, 'userInfo')) {
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
    var userInfo = parseUserInfo(request);
    var username = userInfo.username ? userInfo.username : '';
    var userId = userInfo.userId;
    var userTelephone = userInfo.phone;
    var userSocialId = userInfo.sid;
    var userRealName = userInfo.name;

    response.render('new_reservation', {
        username: username,
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
            "price": bodyParams.price,
            "day": bodyParams.day
        }
    });
};

// Submit request
// post (need x-www-form-urlencoded data)
exports.onSubmit = function(request, response) {
    var _sa = checkVars('cookies', request.cookies, 'userInfo');
    var _sb = checkVars('body', request.body, 'hospitalId', 'departmentId', 'doctorId', 'resvTime', 'resvDate');

    if (_sa === false || _sb === false) {
        __invalidArgsError(response);
        return;
    }

    var userInfo = parseUserInfo(request);
    var userId = userInfo.userId; // from cookie;
    var hospitalId = request.body.hospitalId; // from prev page
    var departmentId = request.body.departmentId; // from prev page
    var doctorId = request.body.doctorId; // from prev page
    var time = request.body.resvTime; // from prev page
    var date = request.body.resvDate; // from prev page
    var day = request.body.day;

    var url = '/user/reservation/add';
    var data = {
        user_id: userId,
        hospital_id: hospitalId,
        department_id: departmentId,
        doctor_id: doctorId,
        date: date,
        period: time,
        week: day,
        paid_flag: false
    };
    fireRequest('POST', url, serialize(data), function(res) {
        if (res == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        var resvId = res.id;
        response.redirect(302, '/reservation/' + doctorId + '/' + resvId + '/success');
    }, false);
};

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
// get
exports.showReservation = function(request, response) {
    if (!checkVars('cookies', request.cookies, 'userInfo')) {
        __invalidArgsError(response);
        return;
    }
    var userInfo = parseUserInfo(request);
    var username = userInfo.username;
    var userRealName = userInfo.userRealName;
    var userTel = userInfo.userTelephone;
    var userSid = userInfo.userSocialId;
    var resvId = request.params.reservation_id;
    var doctorId = request.params.doctor_id;
    var doctorDetail = null;
    var resvDetail = null;
    var ctr = 0;
    var url1 = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        resvDetail = res;
        ++ctr;
        render();
    }, false);

    var url2 = '/hospital/doctor/' + doctorId + '/detail';
    fireRequest('GET', url2, null, function(res) {
        doctorDetail = res;
        ++ctr;
        render();
    }, false);

    var render = function() {
        if (ctr !== 2)
            return;
        if (resvDetail == null || doctorDetail == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        if (resvDetail == stdNotFound || doctorDetail == stdNotFound) {
            __entityNotFound(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('reservation', {
            username: username,
            state: 'normal',
            userRealName: userRealName,
            userTelephone: userTel,
            userSocialId: userSid,
            resvDetail: resvDetail,
            doctorDetail: doctorDetail
        });
    }
};

exports.showReservationWithSuccessMessage = function(request, response) {
    if (!checkVars('cookies', request.cookies, 'userInfo')) {
        __invalidArgsError(response);
        return;
    }
    var userInfo = parseUserInfo(request);
    var username = userInfo.username;
    var userRealName = userInfo.userRealName;
    var userTel = userInfo.userTelephone;
    var userSid = userInfo.userSocialId;
    var resvId = request.params.reservation_id;
    var doctorId = request.params.doctor_id;
    var doctorDetail = null;
    var resvDetail = null;
    var ctr = 0;
    var url1 = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        resvDetail = res;
        ++ctr;
        render();
    }, false);

    var url2 = '/hospital/doctor/' + doctorId + '/detail';
    fireRequest('GET', url2, null, function(res) {
        doctorDetail = res;
        ++ctr;
        render();
    }, false);

    var render = function() {
        if (ctr !== 2)
            return;
        if (resvDetail == null || doctorDetail == null) {
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }

        response.render('reservation', {
            username: username,
            state: 'success',
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
            __fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render(request.params.template, res);
    }, false);
};