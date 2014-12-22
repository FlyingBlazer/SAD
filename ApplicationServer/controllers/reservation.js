/*
 * Copyright (c) 2012 Miles Shang <mail@mshang.ca>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * Usage:
 * Set your settings:
 *   base64.settings.char62 = "-";
 *   base64.settings.char63 = "_";
 *   etc.
 *
 * Then:
 * base64.encode(str) takes a string and returns the base64 encoding of it.
 * base64.decode(str) does the reverse.
 */

/* TODO:
 * Add a "padding_mandatory" flag to check for bad padding in the decoder.
 * Add test cases that throw errors.
 */

var base64 = new Object();

base64.settings = { // defaults
    "char62"        : "+",
    "char63"        : "/",
    "pad"           : "=",
    "ascii"         : false
};

/*
 * Settings:
 * If "pad" is not null or undefined, then it will be used for encoding.
 *
 * If "ascii" is set to true, then the encoder
 * will assume that plaintext is in 8-bit chars (the standard).
 * In this case, for every 3 chars in plaintext, you get 4 chars of base64.
 * Any non-8-bit chars will cause an error.
 * Otherwise, assume that all plaintext can be in the full range
 * of Javascript chars, i.e. 16 bits. Get 8 chars of base64 for 3 chars
 * of plaintext. Any possible JS string can be encoded.
 */

base64.encode = function (str) {
    this.char_set =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        + this.settings.char62 + this.settings.char63;

    var output = ""; // final output
    var buf = ""; // binary buffer
    for (var i = 0; i < str.length; ++i) {
        var c_num = str.charCodeAt(i);
        if (this.settings.ascii)
            if (c_num >= 256)
                throw "Not an 8-bit char.";
        var c_bin = c_num.toString(2);
        while (c_bin.length < (this.settings.ascii ? 8 : 16))
            c_bin = "0" + c_bin;
        buf += c_bin;

        while (buf.length >= 6) {
            var sextet = buf.slice(0, 6);
            buf = buf.slice(6);
            output += this.char_set.charAt(parseInt(sextet, 2));
        }
    }

    if (buf) { // not empty
        while (buf.length < 6) buf += "0";
        output += this.char_set.charAt(parseInt(buf, 2));
    }

    if (this.settings.pad)
        while (output.length % (this.settings.ascii ? 4 : 8) != 0)
            output += this.settings.pad;

    return output;
}

base64.decode = function (str) {
    this.char_set =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        + this.settings.char62 + this.settings.char63;

    var output = ""; // final output
    var buf = ""; // binary buffer
    var bits = (this.settings.ascii ? 8 : 16);
    for (var i = 0; i < str.length; ++i) {
        if (str[i] == this.settings.pad) break;
        var c_num = this.char_set.indexOf(str.charAt(i));
        if (c_num == -1) throw "Not base64.";
        var c_bin = c_num.toString(2);
        while (c_bin.length < 6) c_bin = "0" + c_bin;
        buf += c_bin;

        while (buf.length >= bits) {
            var octet = buf.slice(0, bits);
            buf = buf.slice(bits);
            output += String.fromCharCode(parseInt(octet, 2));
        }
    }
    return output;
}


/**
 * Created by renfei on 14/12/6.
 */

// util

var settings = require('../../settings.json');

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

var py2cn = {};
py2cn['beijing']='北京市';
py2cn['tianjin']='天津市';
py2cn['hebei']='河北省';
py2cn['shanxi']='山西省';
py2cn['neimenggu']='内蒙古自治区';
py2cn['liaoning']='辽宁省';
py2cn['jilin']='吉林省';
py2cn['heilongjiang']='黑龙江省';
py2cn['shanghai']='上海市';
py2cn['jiangsu']='江苏省';
py2cn['zhejiang']='浙江省';
py2cn['anhui']='安徽省';
py2cn['fujian']='福建省';
py2cn['jiangxi']='江西省';
py2cn['jiangxi']='山东省';
py2cn['henan']='河南省';
py2cn['hubei']='湖北省';
py2cn['hunan']='湖南省';
py2cn['guangdong']='广东省';
py2cn['guangxi']='广西省';
py2cn['hainan']='海南省';
py2cn['chongqing']='重庆市';
py2cn['sichuan']='四川省';
py2cn['guizhou']='贵州省';
py2cn['yunnan']='云南省';
py2cn['xizang']='西藏自治区';
py2cn['shaanxi']='陕西省';
py2cn['gansu']='甘肃省';
py2cn['qinghai']='青海省';
py2cn['ningxia']='宁夏回族自治区';
py2cn['xinjiang']='新疆维吾尔族自治区';

var logError = function(errMsg) {
    console.error('(!) # FATAL ERROR # ...');
    for (var i = 0; i < arguments.length; ++i) {
        console.error(arguments[i]);
    }
};

var parseUserInfo = function(request) {
    return JSON.parse(new Buffer(request.cookies.userInfo, 'hex').toString());
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

var fatalError = function(response, identifier) {
    response.status(503).send('HTTP/1.1 Error 503 Service Unavailable');
    logError('Incorrect content received from Business server (if it exists). Identifier: ' + identifier,
        'Terminating...');
};

var invalidArgsError = function(response) {
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
    var callbackSent = false;
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
                callbackSent = true;
                callback(null);
            }

            // check response error code
            if (srcObject) {
                if (srcObject.code != 0) {
                    logError('Warning: Unsuccessful response returned from business server.',
                        ' > Request URL: ' + path,
                        ' > Server response: ' + responseData);
                }
                callback(srcObject);
            }
        });
    });

    req.on('error', function(e) {
        logError('Business server is DOWN: ' + e.message,
            ' > When requesting: ' + path);
        callbackSent = true;
        callback(null);
    });

    if (data !== null)
        req.write(data);

    req.end();

    // timeout
    setTimeout(function() {
        if (callbackSent === false) {
            callbackSent = true;
            callback(null);
            logError('Request timed out when requesting Business server.',
                ' > Request URL: ' + path);
        }
    }, 5000);
};

// Choose a location
// No view, just set cookie and redirect to home page
// get
exports.chooseLocation = function(request, response) {
    if (typeof request.params.province !== 'undefined') {
        var province = request.params.province;
        response.cookie('province', province, {
            maxAge: 999999999,
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
            fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('hospital_list', {
            code: res.code || 0,
            message: res.message,
            username: username,
            search: false,
            searchText: null,
            province: py2cn[province],
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
            fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        response.render('hospital_list', {
            code: res.code || 0,
            message: res.message,
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
            fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }

        var code = 0, message = '';

        if (detail.code != 0) {
            code = detail.code;
            message = detail.message;
        } else if (departments.code != 0) {
            code = departments.code;
            message = departments.message;
        } else if (doctors.code != 0) {
            code = doctors.code;
            message = doctors.message;
        }

        detail.province = py2cn[detail.province];

        response.render('hospital', {
            code: code,
            message: message,
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

    var username = userInfo.username || '';
    var expertId = request.params.expert_id;
    var hospitalId = request.params.hospital_id;
    var departmentId = request.params.department_id;
    var code = request.params.err_code || 0;

    fireRequest('GET', '/user/' + userInfo.userId + '/info', null, function(res) {
        var status = res.status;
        fireRequest('GET', '/hospital/doctor/' + expertId + '/detail', null, function(res) {
            if (res == null) {
                fatalError(response, 'Line=' + __line + ', Func=' + __function);
                return;
            }
            if (res.code != 0) {
                code = res.code;
            }
            response.render('doctor', {
                code: code,
                message: res.message,
                username: username,
                status: status,
                errCode: code,
                hospitalId: hospitalId,
                departmentId: departmentId,
                detail: res
            });
        });
    });
};

// post (need x-www-form-urlencoded data)
exports.confirm = function(request, response) {

    // if request body is incorrect, reject the request
    if (!checkVars('body', request.body, 'hospital', 'hospitalId', 'department', 'departmentId', 'doctor', 'doctorId', 'resvDate', 'resvTime', 'title', 'price')) {
        invalidArgsError(response);
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
        response.redirect(302, '/account/login');
        return;
    }

    // if control reaches here, start the normal rendering process
    var userInfo = parseUserInfo(request);
    var username = userInfo.username || '';
    var userId = userInfo.userId;
    var userTelephone = userInfo.phone;
    var userSocialId = userInfo.sid;
    var userRealName = userInfo.name;

    response.render('new_reservation', {
        username: username,
        code: 0,
        message: 'success',
        detail: {
            username: username,
            userId: userId,
            userTelephone: userTelephone,
            userSocialId: userSocialId,
            userRealName: userRealName,
            hospital: bodyParams.hospital,
            hospitalId: bodyParams.hospitalId,
            department: bodyParams.department,
            departmentId: bodyParams.departmentId,
            doctor: bodyParams.doctor,
            doctorId: bodyParams.doctorId,
            doctorTitle: bodyParams.title,
            date: bodyParams.resvDate,
            time: bodyParams.resvTime,
            price: bodyParams.price,
            day: bodyParams.day
        }
    });
};

// Submit request
// post (need x-www-form-urlencoded data)
exports.onSubmit = function(request, response) {
    var _sa = checkVars('cookies', request.cookies, 'userInfo');
    var _sb = checkVars('body', request.body, 'hospitalId', 'departmentId', 'doctorId', 'resvTime', 'resvDate');

    if (_sa === false || _sb === false) {
        invalidArgsError(response);
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
        paid_flag: false,
        pay_method: 1
    };

    fireRequest('POST', url, serialize(data), function(res) {
        if (res == null) {
            fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        if (res.code != 0) {
            response.redirect(302, '/concierge/reserve/' + hospitalId + '/' + departmentId + '/' + doctorId + '/' + res.code);
            return;
        }
        var resvId = res.id;
        response.redirect(302, '/reservation/' + resvId);
    }, false);
};

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
// get
exports.showReservation = function(request, response) {
    if (!checkVars('cookies', request.cookies, 'userInfo')) {
        invalidArgsError(response);
        return;
    }
    var userInfo = parseUserInfo(request);
    var username = userInfo.username;
    var userRealName = userInfo.name;
    var userTel = userInfo.phone;
    var userSid = userInfo.sid;
    var resvId = request.params.reservation_id;
    var message = request.params.message;
    var doctorDetail = null;
    var resvDetail = null;

    var getDoctorDetail = function() {
        var url2 = '/hospital/doctor/' + resvDetail.doctor_id + '/detail';
        fireRequest('GET', url2, null, function(res) {
            doctorDetail = res;
            if (doctorDetail == null) {
                fatalError(response, 'Line=' + __line + ', Func=' + __function);
                return;
            }
            render();
        }, false);
    };

    var url1 = '/user/reservation/' + resvId + '/detail';
    fireRequest('GET', url1, null, function(res) {
        resvDetail = res;
        if (resvDetail == null) {
            fatalError(response, 'Line=' + __line + ', Func=' + __function);
            return;
        }
        getDoctorDetail();
    }, false);

    var render = function() {
        var code = 0;
        if (resvDetail.code && resvDetail.code != 0)
            code = resvDetail.code;
        if (doctorDetail.code && doctorDetail.code != 0)
            code = doctorDetail.code;
        response.render('reservation', {
            username: username,
            state: 'normal',
            userRealName: userRealName,
            userTelephone: userTel,
            userSocialId: userSid,
            resvDetail: resvDetail,
            doctorDetail: doctorDetail,
            code: code,
            message: message ? message : ''
        });
    }
};

// get
exports.pay = function(request, response) {
    var resvId = request.params.reservation_id;
    var url = '/user/reservation/' + resvId + '/pay';
    fireRequest('POST', url, null, function() {
        response.redirect(302, '/reservation/' + resvId + '/m/pay_success');
    });
};

// get
exports.cancel = function(request, response) {
    var resvId = request.params.reservation_id;
    var url = '/user/reservation/' + resvId + '/cancel';
    fireRequest('POST', url, null, function() {
        response.redirect(302, '/account/manage/reservation/m/cancel_success');
    });
};

exports.reservationCertificate = function(request, response) {
    var key = request.params.key;
    var obj = JSON.parse(base64.decode(key));
    var gender = obj.sid.length == 17 ? (obj.sid[16] % 2 == 0 ? '女' : '男') : '男';
    var age = 2014 - parseInt(obj.sid.substr(6, 4));
    var now = new Date();
    var time = now.getFullYear() + '年' + (parseInt(now.getMonth()) + 1) + '月' + now.getDate();
    time = time + '日 ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    response.render('service_reservation', {
        hospitalName: obj.hospitalName,
        reservationId: obj.reservationId,
        name: obj.name,
        date: obj.date,
        gender: gender,
        age: age,
        sid: obj.sid,
        phone: obj.phone,
        department: obj.department,
        doctor: obj.doctor,
        price: obj.price,
        generationTime: time
    });
};

exports.registryCertificate = function(request, response) {
    var key = request.params.key;
    var obj = JSON.parse(base64.decode(key));
    var gender = obj.sid.length == 17 ? (obj.sid[16] % 2 == 0 ? '女' : '男') : '男';
    var age = 2014 - parseInt(obj.sid.substr(6, 4));
    var now = new Date();
    var time = now.getFullYear() + '年' + (parseInt(now.getMonth()) + 1) + '月' + now.getDate();
    time = time + '日 ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    response.render('service_registry', {
        hospitalName: obj.hospitalName,
        reservationId: obj.reservationId,
        name: obj.name,
        date: obj.date,
        gender: gender,
        age: age,
        sid: obj.sid,
        phone: obj.phone,
        department: obj.department,
        doctor: obj.doctor,
        price: obj.price,
        generationTime: time
    });
};