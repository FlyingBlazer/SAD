/**
 * Created by renfei on 14/12/6.
 */

var queryString = require('querystring');
var url = require('url');
var http = require('http');
var settings = require('../../settings');
var businessServerInfo = 'localhost:' + settings.port.business;

/**
 * 渲染主页
 * @param request
 * @param response
 */
exports.home = function (request, response) {
    //TODO 判定是否注册  传参
    response.render('sb_home');
};

/**
 * 渲染登录页面
 * @param request
 * @param response
 */
exports.login = function (request, response) {
    var initTimestamp = request.params.initTimestamp;
    var msgType = request.params.msgType;
    var message = request.params.message;

    var params = {
        username: getCookie(request).username,
        userId: getCookie(request).userId,
        hospitalId: getCookie(request).hospitalId,
        hospitalName: getCookie(request).hospitalName,
        businessServer: getCookie(request).businessServer,
        initTimestamp: isNullOrUndefined(initTimestamp) ? '' : initTimestamp,
        msgType: isNullOrUndefined(msgType) ? '' : msgType,
        message: isNullOrUndefined(message) ? '' : message
    };

    response.render('sb_login', params);
};

/**
 * 转发登录请求
 * POST
 * 成功就跳转到/backstage(并写cookie)
 * 失败跳转到/backstage/login，添加错误提示wrong_credentials
 * @param request
 * @param response
 */
exports.onLogin = function (request, response) {
    var requestBody = request.body;
    var username = requestBody.username;
    var password = requestBody.password;

    var path = '/admin/login';
    var data = {
        'username': username,
        'password': password
    };

    printLogMessage('on login: username=' + username + '  password=' + password);


    //TODO dummy implementation
    setCookie(response, username, '1', '1', 'hospital name', businessServerInfo);
    printLogMessage('cookie : ' + JSON.stringify(getCookie(request)));
    var redirectPath = '/backstage';
    response.redirect(redirectPath);
    return;


    var loginCallback = function (result) {

        printLogMessage('result : ' + JSON.stringify(result));

        //直接返回result
        if (result.code == 0 && result.message == 'success') {//登录成功:跳转并设置cookie

            var hospitalId = result.hospitalId;
            var adminId = result.adminId;

            //跳转到 /backstage 页面
            var jump = function (hospitalInfo) {

                //存入cookie
                setCookie(response, username, adminId, hospitalId, hospitalInfo.name, businessServerInfo);

                //跳转
                var redirectPath = '/backstage';
                response.redirect(redirectPath);
            };

            //根据hospital id获取hospital name
            var queryUrl = '/hospital/hospital/' + hospitalId + '/detail';
            forwardRequestGET(queryUrl, jump);

        } else {
            var redirectPath = '/backstage/login/' + getCurrentTimeInSeconds() + '/fail/wrong_credentials';
            response.redirect(redirectPath);
        }
    };

    forwardRequestPOST(data, path, loginCallback);
};

/**
 * 登出
 * 清空cookie，跳转到/backstage/login
 * @param request
 * @param response
 */
exports.logout = function (request, response) {
    clearCookie(response);
    response.redirect('/backstage/login');
};

/**
 * 渲染修改密码页
 * @param request
 * @param response
 */
exports.changePassword = function (request, response) {
    if (!getCookie(request).username)
        response.redirect('/backstage/login');
    else {
        var initTimestamp = request.params.initTimestamp;
        var msgType = request.params.msgType;
        var message = request.params.message;

        var params = {
            username: getCookie(request).username,
            userId: getCookie(request).userId,
            hospitalId: getCookie(request).hospitalId,
            hospitalName: getCookie(request).hospitalName,
            businessServer: getCookie(request).businessServer,
            initTimestamp: isNullOrUndefined(initTimestamp) ? '' : initTimestamp,
            msgType: isNullOrUndefined(msgType) ? '' : msgType,
            message: isNullOrUndefined(message) ? '' : message
        };

        response.render('sb_changePassword', params);
    }
};

/**
 * 修改密码
 * POST
 * 完成后跳转到/backstage/account，添加成功提示complete或失败提示wrong_credential
 * @param request
 * @param response
 */
exports.onChangePassword = function (request, response) {

    var requestBody = request.body;
    var username = requestBody.username;
    var original_password = requestBody.originalPassword;
    var new_password = requestBody.newPassword;

    var path = '/admin/change_password';
    var data = {
        username: username,
        original_password: original_password,
        new_password: new_password
    };

    var callback = function (result) {
        var redirectPath = '/backstage/account';
        if (result.code == 0) {//修改成功
            redirectPath = '/backstage/account/success/complete';
        } else {//修改失败
            redirectPath = '/backstage/account/fail/wrong_credential';
        }
        response.redirect(redirectPath);
    };

    forwardRequestPOST(data, path, callback);
};

/**
 * 渲染管理医院页面
 * @param request
 * @param response
 */
exports.hospitals = function (request, response) {

    if (!getCookie(request).username)
        response.redirect('/backstage/login');
    else {
        var callback = function (result) {
            if (result.code == 0) {
                //传参并渲染页面
                var initTimestamp = request.params.initTimestamp;
                var msgType = request.params.msgType;
                var message = request.params.message;

                var params = {
                    username: getCookie(request).username,
                    userId: getCookie(request).userId,
                    hospitalId: getCookie(request).hospitalId,
                    hospitalName: getCookie(request).hospitalName,
                    businessServer: getCookie(request).businessServer,
                    initTimestamp: isNullOrUndefined(initTimestamp) ? '' : initTimestamp,
                    msgType: isNullOrUndefined(msgType) ? '' : msgType,
                    message: isNullOrUndefined(message) ? '' : message,
                    list: result.hospitals
                };

                response.render('sb_hospitals', params);
            } else {
                printLogMessage(result.message);
            }
        };

        forwardRequestGET('/hospital/hospital/list', callback);
    }
};

/**
 * 渲染科室页面
 * @param request
 * @param response
 */
exports.departments = function (request, response) {

    if (!getCookie(request).username)
        response.redirect('/backstage/login');
    else {
        //传参并渲染
        var hospitalId = getCookie(request).hospitalId;
        if (typeof hospitalId == 'undefined' || !hospitalId)
            printLogMessage('hospital id 不能为空');
        else {
            var callback = function (departments_list) {

                var initTimestamp = request.params.initTimestamp;
                var msgType = request.params.msgType;
                var message = request.params.message;

                var params = {
                    username: getCookie(request).username,
                    userId: getCookie(request).userId,
                    hospitalId: getCookie(request).hospitalId,
                    hospitalName: getCookie(request).hospitalName,
                    businessServer: getCookie(request).businessServer,
                    initTimestamp: isNullOrUndefined(initTimestamp) ? '' : initTimestamp,
                    msgType: isNullOrUndefined(msgType) ? '' : msgType,
                    message: isNullOrUndefined(message) ? '' : message,
                    list: departments_list
                };

                response.render('sb_departments', params);
            };
            //forwardRequestGET('/hospital/department/' + hospitalId, callback);
            retrieveDepartmentList(hospitalId, callback);
        }
    }
};

/**
 * 渲染管理医生页面
 * @param request
 * @param response
 */
exports.doctors = function (request, response) {

    if (!getCookie(request).username)
        response.redirect('/backstage/login');
    else {
        var hospitalId = getCookie(request).hospitalId;
        if (typeof hospitalId == 'undefined' || !hospitalId)
            printLogMessage('hospital id 不能为空');
        else {
            //获取科室信息和医生信息
            retrieveDepartmentList(hospitalId, function (departments_list) {
                retrieveDoctorList(hospitalId, function (doctors) {

                    var initTimestamp = request.params.initTimestamp;
                    var msgType = request.params.msgType;
                    var message = request.params.message;

                    var params = {
                        username: getCookie(request).username,
                        userId: getCookie(request).userId,
                        hospitalId: getCookie(request).hospitalId,
                        hospitalName: getCookie(request).hospitalName,
                        businessServer: getCookie(request).businessServer,
                        initTimestamp: isNullOrUndefined(initTimestamp) ? '' : initTimestamp,
                        msgType: isNullOrUndefined(msgType) ? '' : msgType,
                        message: isNullOrUndefined(message) ? '' : message,
                        departments: departments_list,
                        list: doctors
                    };

                    response.render('sb_doctors', params);
                });
            });
        }
    }
};

/**
 * 渲染管理预约页面
 * @param request
 * @param response
 */
exports.reservations = function (request, response) {

    printLogMessage('1');
    //TODO dummy implementation
    var param = {
        username: getCookie(request).username,
        userId: getCookie(request).userId,
        hospitalId: getCookie(request).hospitalId,
        hospitalName: getCookie(request).hospitalName,
        businessServer: getCookie(request).businessServer,
        list: [
            {
                "reservation_id": 12345,
                "time": "2014-12-16 08:50:00",
                "price": "23.33",
                "status": "000000",
                "status_msg": "在线支付，已付款",
                "hospital_name": "XX hospital",
                "department_name": "psychology",
                "doctor_name": "杨伟",
                "user_name": "渣诚",
                "user_phone": "18622222222",
                "user_sid": "12010319921000100X"
            },
            {
                "reservation_id": 12345,
                "time": "2014-12-16 08:50:00",
                "price": "23.33",
                "status": "000000",
                "status_msg": "在线支付，已付款",
                "hospital_name": "XX hospital",
                "department_name": "psychology",
                "doctor_name": "杨伟",
                "user_name": "渣诚",
                "user_phone": "18622222222",
                "user_sid": "12010319921000100X"
            }]
    };
    printLogMessage(2);
    response.render('sb_reservations', param);
    printLogMessage(3);
    return;


    var hospitalId = getCookie(request).hospitalId;
    if (!isNullOrUndefined(hospitalId) || !isNullOrUndefined(getCookie(request).userId)) {//未登录
        response.redirect('/backstage/login');
    } else {
        var path = '/reservation/' + hospitalId + '/list';
        forwardRequestGET(path, function (result) {
            if (result.code == 0) {
                response.render('sb_reservations', {
                    username: getCookie(request).username,
                    userId: getCookie(request).userId,
                    hospitalId: getCookie(request).hospitalId,
                    hospitalName: getCookie(request).hospitalName,
                    businessServer: getCookie(request).businessServer,
                    list: result.reservations
                });
            } else {
                printLogMessage(result.message);
            }
        });
    }
};

/**
 * 添加医院
 * POST
 * @param request
 * @param response
 */
exports.addHospital = function (request, response) {

    var requestBody = request.body;

    var data = {
        name: requestBody.name,
        level: requestBody.level,
        province: requestBody.province,
        city: '',//上传的数据中不包含city
        address: requestBody.address,
        telephone: requestBody.telephone,
        website: requestBody.website,
        description: requestBody.description
    };

    var path = '/hospital/hospital/add';
    forwardRequestPOST(data, path, function (result) {
        if (result.code == 0) {
            response.redirect('/backstage/manage-hospitals/' + getCurrentTimeInSeconds() + '/success/complete');
        } else {
            response.redirect('/backstage/manage-hospitals/' + getCurrentTimeInSeconds() + '/fail/unknown');
        }
    });
};

/**
 * 添加科室
 * POST
 * @param request
 * @param response
 */
exports.addDepartment = function (request, response) {
    var requestBody = request.body;

    var data = {
        name: requestBody.name,
        hospital_id: requestBody.hospital_id,
        phone: requestBody.phone,
        description: requestBody.description
    };

    var path = '/hospital/department/add';
    forwardRequestPOST(data, path, function (result) {
        if (result.code == 0) {
            response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/success/complete');
        } else {
            response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/fail/unknown');
        }
    });


};

/**
 * 添加医生
 * POST
 * @param request
 * @param response
 */
exports.addDoctor = function (request, response) {
    var requestBody = request.body;

    var data = {
        name: requestBody.name,
        hospital_id: requestBody.hospital_id,
        department_id: requestBody.department_id,
        //photo: requestBody.photo,
        photo: '',//TODO pending
        description: requestBody.description,
        title: requestBody.title,
        price: requestBody.price
    };

    var timeSlots = requestBody.timeSlots;

    var path = '/hospital/doctor/add';
    forwardRequestPOST(data, path, function (result) {
        if (result == 0) {
            //添加排班信息
            var doctor_id = result.doctor_id;
            var adminId = getCookie(request).userId;
            var addTimeSlotsPath = '/hospital/doctor/' + doctor_id + '/working/week/add';

            forwardRequestPOST({
                    week: timeSlots,
                    adminId: adminId
                },
                addTimeSlotsPath, function (feedback) {
                    if (feedback.code == 0) {
                        response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/success/complete');
                    } else {
                        response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/fail/unknown');
                    }
                });
        } else {
            response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/fail/unknown');
        }
    });

    response.redirect('/backstage/account');
};

/**
 * 渲染编辑排班页面
 * GET
 * URL中参数为id(医生id)
 * @param request
 * @param response
 */
exports.editSchedule = function (request, response) {

    var doctorId = request.params.id;
    var adminId = getCookie(request).adminId;

    var doctorInfoCallback = function (doctorInfo) {
        retrieveDoctorSchedule(doctorId, adminId, function (schedule) {
            if (schedule.code == 0) {
                var params = {
                    username: getCookie(request).username,
                    userId: getCookie(request).userId,
                    hospitalId: getCookie(request).hospitalId,
                    hospitalName: getCookie(request).hospitalName,
                    businessServer: getCookie(request).businessServer,
                    doctorId: doctorInfo.id,
                    doctorName: doctorInfo.name,
                    doctorHospital: doctorInfo.hospital,
                    doctorDepartment: doctorInfo.department,
                    schedule: schedule
                };
                response.render('sb_edit-schedule', params);
            } else {
                printLogMessage(schedule.message);
            }
        });
    };

    retrieveDoctorInfo(doctorId, doctorInfoCallback);
};

exports.users = function (request, response) {
//TODO


    response.render('sb_users');
};

/**
 * 获得cookie
 * cookie 中所有的key已经去掉sb_前缀
 * @param request
 */
function getCookie(request) {
    return {
        'username': request.cookies.sb_username,
        'userId': request.cookies.sb_userId,
        'hospitalId': request.cookies.sb_hospitalId,
        'hospitalName': request.cookies.sb_hospitalName,
        'businessServer': request.cookies.sb_businessServer
    };
}

/**
 * 在header中设置cookie
 * cookie内包含完整的用户信息
 * @param response
 * @param username
 * @param userId
 * @param hospitalId
 * @param hospitalName
 * @param businessServer
 */
function setCookie(response, username, userId, hospitalId, hospitalName, businessServer) {
    var options = {
        expires: new Date(Date.now() + 900000000),
        path: '/'
    };

    response.cookie('sb_username', username, options);
    response.cookie('sb_userId', userId, options);
    response.cookie('sb_hospitalId', hospitalId, options);
    response.cookie('sb_hospitalName', hospitalName, options);
    response.cookie('sb_businessServer', businessServer, options);
}

/**
 * 清空全部cookie
 * @param response
 */
function clearCookie(response) {
    var options = {path: '/'};
    response.clearCookie('sb_username', options);
    response.clearCookie('sb_userId', options);
    response.clearCookie('sb_hospitalId', options);
    response.clearCookie('sb_hospitalName', options);
    response.clearCookie('sb_businessServer', options);
}

/**
 * 向业务服务器转发请求
 * POST
 * @param data
 * @param path 业务服务器路径
 * @param callback 业务服务器返回的结果(JSON Object)
 */
function forwardRequestPOST(data, path, callback) {
    forwardRequest('POST', path, queryString.stringify(data), callback);
}

/**
 * 向业务服务器转发请求
 * GET
 * @param path 业务服务器路径
 * @param callback 参数为业务服务器返回的结果(JSON Object)
 */
function forwardRequestGET(path, callback) {
    forwardRequest('GET', path, null, callback);
}

/**
 * 向业务服务器转发请求
 * @param method POST/GET
 * @param path
 * @param data
 * @param callback 参数为返回的结果(JSON Object)
 */
function forwardRequest(method, path, data, callback) {
    var options;
    if (method == 'GET')
        options = {
            host: 'localhost',
            port: settings.port.business,
            method: method,
            path: path
        }; else if (method == 'POST')
        options = {
            host: 'localhost',
            port: settings.port.business,
            method: method,
            path: path,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

    var responseData = '';
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseData += chunk;
        });
        res.on('end', function () {
            var srcObject = null;
            try {
                srcObject = JSON.parse(responseData);
            } catch (e) {
                printLogMessage('Cannot parse response data.');
                //console.error(e);
            }
            callback(srcObject);
        });
        res.on('error', function (e) {
            printLogMessage('Business server is down: ' + e.message);
            callback(null);
        });
    });
    if (data !== null)
        req.write(data);
    req.end();
}
/**
 * 打印调试信息
 * @param message
 */
function printLogMessage(message) {
    console.log(message);
}

/**
 * 返回当前时间戳
 * 单位为秒
 */
function getCurrentTimeInSeconds() {
    return Date.parse(new Date()) / 1000;
}

/**
 * 根据hospital id获取所有科室信息
 *
 * @param hospitalId
 * @param callback 参数为包含科室信息的departments_list
 */
function retrieveDepartmentList(hospitalId, callback) {

    var handler = function (result) {
        if (result.code == 0) {
            callback(result.departments_list);
        } else {
            printLogMessage(result.message);
        }
    };

    forwardRequestGET('/hospital/department/' + hospitalId, handler);
}

/**
 * 根据hospital id获取所有医生信息
 * @param hospitalId
 * @param callback 参数为doctors
 */
function retrieveDoctorList(hospitalId, callback) {
    var handler = function (result) {
        if (result.code == 0) {
            callback(result.doctors);
        } else
            printLogMessage(result.message);
    };

    forwardRequestGET('/hospital/department/' + hospitalId, handler);
}

/**
 * 获取医生信息
 * id、name、hospital、department
 * @param doctorId
 * @param callback 参数为doctorInfo(包含id、name、hospital、department)
 */
function retrieveDoctorInfo(doctorId, callback) {
    var path = '/hospital/doctor/' + doctorId + '/detail';
    forwardRequestGET(path, function (result) {
        var doctorInfo = {
            id: result.id,
            name: result.name,
            hospital: result.hospital,
            department: result.department
        };
        callback(doctorInfo);
    });
}

/**
 *获取医生排班信息
 * @param doctorId
 * @param adminId
 * @param callback 参数为schedule
 */
function retrieveDoctorSchedule(doctorId, adminId, callback) {
    var path = '/hospital/doctor/' + doctorId + '/working/getraw?adminId=' + adminId;
    forwardRequestGET(path, callback);
}

/**
 * 判断是否为空或未定义
 * @param data
 * @returns {boolean}
 */
function isNullOrUndefined(data) {
    return !data;
}

