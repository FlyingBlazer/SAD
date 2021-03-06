/**
 * Created by renfei on 14/12/6.
 */

var qs = require('qs');
var url = require('url');
var http = require('http');
var settings = require('../../settings');
var businessServerInfo = 'localhost:' + settings.port.business;

var py2cn = {};
py2cn['beijing'] = '北京市';
py2cn['tianjin'] = '天津市';
py2cn['hebei'] = '河北省';
py2cn['shanxi'] = '山西省';
py2cn['neimenggu'] = '内蒙古自治区';
py2cn['liaoning'] = '辽宁省';
py2cn['jilin'] = '吉林省';
py2cn['heilongjiang'] = '黑龙江省';
py2cn['shanghai'] = '上海市';
py2cn['jiangsu'] = '江苏省';
py2cn['zhejiang'] = '浙江省';
py2cn['anhui'] = '安徽省';
py2cn['fujian'] = '福建省';
py2cn['jiangxi'] = '江西省';
py2cn['jiangxi'] = '山东省';
py2cn['henan'] = '河南省';
py2cn['hubei'] = '湖北省';
py2cn['hunan'] = '湖南省';
py2cn['guangdong'] = '广东省';
py2cn['guangxi'] = '广西省';
py2cn['hainan'] = '海南省';
py2cn['chongqing'] = '重庆市';
py2cn['sichuan'] = '四川省';
py2cn['guizhou'] = '贵州省';
py2cn['yunnan'] = '云南省';
py2cn['xizang'] = '西藏自治区';
py2cn['shaanxi'] = '陕西省';
py2cn['gansu'] = '甘肃省';
py2cn['qinghai'] = '青海省';
py2cn['ningxia'] = '宁夏回族自治区';
py2cn['xinjiang'] = '新疆维吾尔族自治区';

/**
 * 渲染主页
 * @param request
 * @param response
 */
exports.home = function (request, response) {
    if (!getCookie(request).username) {
        response.redirect('/backstage/login');
    } else {
        response.render('sb_home', {
            username: getCookie(request).username,
            userId: getCookie(request).userId,
            hospitalId: getCookie(request).hospitalId,
            hospitalName: getCookie(request).hospitalName,
            businessServer: getCookie(request).businessServer
        });
    }
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

    var loginCallback = function (result) {

        printLogMessage('result : ' + JSON.stringify(result));

        //直接返回result
        if (result.code == 0) {//登录成功:跳转并设置cookie

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
            var redirectPath = '/backstage/login/' + getCurrentTimeInSeconds() + '/fail/' + result.message;
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

        //printLogMessage(JSON.stringify(params));

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
    var username = getCookie(request).username;
    var original_password = requestBody.originalPassword;
    var new_password = requestBody.newPassword;

    printLogMessage(JSON.stringify(requestBody));

    var path = '/admin/change_password';
    var data = {
        username: username,
        original_password: original_password,
        new_password: new_password
    };

    printLogMessage(JSON.stringify(data));

    var callback = function (result) {
        var redirectPath = '/backstage/account';
        if (result.code == 0) {//修改成功
            redirectPath = '/backstage/account/' + getCurrentTimeInSeconds() + '/success/cpcomplete';
        } else {//修改失败
            redirectPath = '/backstage/account/' + getCurrentTimeInSeconds() + '/fail/cp_wrong_credential';
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

            //传参并渲染页面
            var initTimestamp = request.params.initTimestamp;
            var msgType = request.params.msgType;
            var message = request.params.message;
            for (var hospital in result.hospitals) {
                result.hospitals[hospital].province = py2cn[result.hospitals[hospital].province];
            }

            //printLogMessage('hospitals:' + JSON.stringify(result.hospitals));

            var params = {
                code: result.code,
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

    //printLogMessage('cookie:' + JSON.stringify(getCookie(request)));

    if (!getCookie(request).username)
        response.redirect('/backstage/login');
    else {
        var hospitalId = getCookie(request).hospitalId;

        if (!hospitalId)
            printLogMessage('hospital id 不能为空');
        else {
            //获取科室信息和医生信息
            retrieveDepartmentList(hospitalId, function (departments_list) {

                //printLogMessage('department_list: ' + JSON.stringify(departments_list));

                retrieveDoctorList(hospitalId, function (doctors) {

                    //printLogMessage('doctors: ' + JSON.stringify(doctors));
                    var doctorListData = [];
                    for (doctor in doctors) {
                        for (item in doctors[doctor]) {
                            doctorListData.push(doctors[doctor][item]);
                        }
                    }

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
                        list: doctorListData
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

    var hospitalId = getCookie(request).hospitalId;

    printLogMessage('cookie: ' + JSON.stringify(getCookie(request)));

    if (isNullOrUndefined(hospitalId) || isNullOrUndefined(getCookie(request).userId)) {//未登录
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
                printLogMessage(result);
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

    //printLogMessage('addHospital:' + JSON.stringify(requestBody));

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
    //printLogMessage('data:' + JSON.stringify(data));

    var path = '/hospital/hospital/add';
    forwardRequestPOST(data, path, function (result) {

        //printLogMessage('add hospital: ' + result.message);

        if (result.code == 0) {
            response.redirect('/backstage/manage-hospitals/' + getCurrentTimeInSeconds() + '/success/ahcomplete');
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
    //printLogMessage('add department: ' + JSON.stringify(requestBody));

    var data = {
        name: requestBody.name,
        hospital_id: getCookie(request).hospitalId,
        phone: requestBody.telephone,
        description: requestBody.description
    };
    //printLogMessage('data:' + JSON.stringify(data));

    var path = '/hospital/department/add';
    forwardRequestPOST(data, path, function (result) {
        if (result.code == 0) {
            response.redirect('/backstage/departments/' + getCurrentTimeInSeconds() + '/success/adcomplete');
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

    //printLogMessage('add doctor:' + JSON.stringify(requestBody));

    var data = {
        name: requestBody.name,
        hospitalId: requestBody.hospitalId,
        departmentId: requestBody.departmentId,
        photo: requestBody.photo,
        description: requestBody.description,
        title: requestBody.title,
        price: requestBody.price
    };
    //printLogMessage('data:' + JSON.stringify(data));
    var timeSlots = JSON.parse(requestBody.timeSlots.toString());
    //printLogMessage('timeSlots:' + JSON.stringify(timeSlots));

    var path = '/hospital/doctor/add';
    forwardRequestPOST(data, path, function (result) {
        if (result.code == 0) {
            //printLogMessage('add doctor: success');
            //添加排班信息
            var doctor_id = result.doctor_id;
            var adminId = getCookie(request).userId;
            var addTimeSlotsData = {
                week: timeSlots,
                adminId: adminId
            };
            var addTimeSlotsPath = '/hospital/doctor/' + doctor_id + '/working/week/add';
            //printLogMessage('addTimeSlotsData:' + JSON.stringify(addTimeSlotsData));

            forwardRequestPOST(addTimeSlotsData, addTimeSlotsPath,
                function (feedback) {
                    printLogMessage(feedback);
                    if (feedback.code == 0) {
                        response.redirect('/backstage/doctors/' + getCurrentTimeInSeconds() + '/success/aecomplete');
                    } else {
                        response.redirect('/backstage/doctors/' + getCurrentTimeInSeconds() + '/fail/unknown');
                    }
                });
        } else {
            printLogMessage('fail:' + result.message);
            response.redirect('/backstage/doctors/' + getCurrentTimeInSeconds() + '/fail/unknown');
        }
    });

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
    var adminId = getCookie(request).userId;

    if (isNullOrUndefined(adminId)) {
        response.redirect('/backstage/login');
    } else {

        var doctorInfoCallback = function (doctorInfo) {

            printLogMessage('doctorInfo:' + JSON.stringify(doctorInfo));

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
                    printLogMessage(schedule);
                }
            });
        };

        retrieveDoctorInfo(doctorId, doctorInfoCallback);
    }
};

/**
 * 渲染审核用户页面
 * @param request
 * @param response
 */
exports.users = function (request, response) {
    var path = '/user/check/list';

    forwardRequestGET(path, function (result) {
        if (result.code == 0) {
            var params = {
                username: getCookie(request).username,
                userId: getCookie(request).userId,
                hospitalId: getCookie(request).hospitalId,
                hospitalName: getCookie(request).hospitalName,
                businessServer: getCookie(request).businessServer,
                validatingList: result.users.validating,
                unqualifiedList: result.users.unqualified
            };

            printLogMessage(JSON.stringify(params));

            response.render('sb_users', params);
        } else {
            printLogMessage(result);
        }
    });
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
    forwardRequest('POST', path, qs.stringify(data), callback);
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
    console.error('### PATH ### ' + path);
    console.error('### DATA ### ' + data);
    console.error('## METHOD ## ' + method);
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
            printLogMessage(result);
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
            //printLogMessage('result:' + JSON.stringify(result));
            callback(result.doctors);
        } else
            printLogMessage(result);
    };

    forwardRequestGET('/hospital/doctor/list?hospitalId=' + hospitalId, handler);
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
        //printLogMessage('retrieveDoctorInfo:' + JSON.stringify(result));
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
    printLogMessage('path=' + path);
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

