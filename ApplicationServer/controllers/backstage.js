/**
 * Created by renfei on 14/12/6.
 */

/**
 * 渲染主页
 * @param request
 * @param response
 */
exports.home = function (request, response) {
    response.render('sb_home');
};

/**
 * 渲染登录页面
 * @param request
 * @param response
 */
exports.login = function (request, response) {
    response.render('sb_login');
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


    var loginCallback = function (result) {
        //直接返回result
        if (result.code == 0 && result.message == 'success') {//登录成功:跳转并设置cookie

            var hospitalId = result.hospital;

            //跳转到 /backstage 页面
            var jump = function (hospitalInfo) {

                //存入cookie
                setCookie(response, username, hospitalId, hospitalInfo.name);

                //跳转
                var redirectPath = '/backstage';
                response.redirect(redirectPath);
            };

            //根据hospital id获取hospital name
            var queryUrl = '/hospital/hospital/' + hospitalId + '/detail';
            forwardRequestGET(queryUrl, jump);

        } else {
            var redirectPath = '/backstage/login/fail/' + result.message;
            response.redirect(redirectPath);

        }

    };

    forwardRequestPOST(data, path, loginCallback);
};

/**
 * 登出
 * 清空cookie，跳转到/login
 * @param request
 * @param response
 */
exports.logout = function (request, response) {
    clearCookie(response);
    response.redirect('/login');
};

exports.changePassword = function (request, response) {

    response.render('sb_changePassword');
};

// post
exports.onChangePassword = function (request, response) {

};

exports.hospitals = function (request, response) {

    response.render('sb_hospitals');
};

exports.departments = function (request, response) {

    response.render('sb_departments');
};

exports.doctors = function (request, response) {

    response.render('sb_doctors');
};

exports.reservations = function (request, response) {

    response.render('sb_reservations');
};

// post
exports.addHospital = function (request, response) {

    response.redirect('/backstage/hospitals');

};

// post
exports.addDepartment = function (request, response) {

    response.redirect('/backstage/departments');
};

// post
exports.addDoctor = function (request, response) {

    response.redirect('/backstage/account');
};

exports.editSchedule = function (request, response) {

    response.render('sb_edit-schedule');
};

// post
exports.modifyTempWorking = function (request, response) {

    var doctorId = '1';//todo temp
    response.redirect('/backstage/doctor/' + doctorId + '/edit_schedule');
};


exports.users = function (request, response) {

};

/**
 * 获得cookie
 * cookie 中所有的key已经去掉sb_前缀
 * @param request
 */
function getCookie(request) {
    return {
        'username': request.cookies.sb_username,
        'hospitalId': request.cookies.sb_hospitalId,
        'hospitalName': request.cookies.sb_hospitalName
    };
}

/**
 * 在header中设置cookie
 * cookie内包含完整的用户信息
 * @param response
 * @param username
 * @param hospitalId
 * @param hospitalName
 */
function setCookie(response, username, hospitalId, hospitalName) {

    var options = {
        expires: new Date(Date.now() + 900000000),
        path: '/'
    };

    response.cookie('sb_username', username, options);
    response.cookie('sb_hospitalId', hospitalId, options);
    response.cookie('sb_hospitalName', hospitalName, options);
}

/**
 * 清空全部cookie
 * @param response
 */
function clearCookie(response) {
    response.clearCookie('sb_username', {path: '/'});
    response.clearCookie('sb_hospitalId', {path: '/'});
    response.clearCookie('sb_hospitalName', {path: '/'});
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
var forwardRequest = function (method, path, data, callback) {
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
};

