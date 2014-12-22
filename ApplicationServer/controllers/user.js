/**
 * Created by renfei on 14/12/6.
 */
var queryString = require('querystring');
var url = require('url');
var http = require('http');
var settings = require('../../settings');

// get
exports.registerPage = function (request, response) {
    //渲染注册界面
    if (request.method.toLowerCase() == 'get') {
        response.render('signup', {
            errorMessage: ''
        });
    }
};

// post
exports.onRegister = function (request, response) {
    //接受并向业务服务器转发注册请求
    if (request.method.toLowerCase() == 'post') {

        //查找当前用户是否存在
        var requestBody = request.body;
        var username = requestBody.username;

        printLogMessage('register : ' + JSON.stringify(requestBody));

        //console.log(requestBody.password);

        var checkPath = '/user/' + username + '/check';

        var registerCallback = function (result) {
            if (result != null) {

                if (result.code == 0) {//注册成功
                    printLogMessage('注册成功');
                    // 跳转到用户个人主页
                    var userId = result.userid;
                    getUserInfo(userId, function (userInfo) {

                        printLogMessage('user info = ' + JSON.stringify(userInfo));

                        setCookie(response, userInfo);//将个人信息写入cookie

                        response.redirect('/');//跳转到主页
                        // 跳转到user页面
                        //response.render('user', {
                        //    name: userInfo.name,
                        //    status: userInfo.status,
                        //    credit: userInfo.credit
                        //});

                    });
                } else {//注册失败
                    //提示错误信息
                    response.render('signup', {
                        errorMessage: result.message
                    });
                }

            }
        };

        var checkCallback = function (checkResult) {
            if (checkResult != null) {
                if (checkResult.code == 0 && checkResult.taken == false) {//未注册

                    var data = {
                        username: request.body.username,
                        password: request.body.password,
                        id: request.body.id,
                        name: request.body.name,
                        phone: request.body.phone,
                        email: request.body.email,
                        ip: request.connection.remoteAddress
                    };
                    printLogMessage('data:' + JSON.stringify(data));

                    forwardRequestPOST(data, '/user/signup', registerCallback);//注册
                } else
                    response.render('signup', {
                        errorMessage: '账号已存在'
                    });
            }
        };

        forwardRequestGET(checkPath, checkCallback);
    }
};

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

// get
exports.loginPage = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        showLoginPage(response);
    }
};

function showLoginPage(response) {
    response.render('login', {
        errorMessage: ' '
    });
}

/**
 * 重定向到登陆界面
 * 主要在userid为空时使用
 * @param response
 */
function redirectToLoginPage(response) {
    response.redirect('/account/login');
}

/**
 * 输出调试信息
 * @param message
 */
function printLogMessage(message) {
    console.log(message);
}

// post
exports.onLogin = function (request, response) {
    if (request.method.toLowerCase() == 'post') {

        var loginPath = '/user/login';

        printLogMessage('-------- ' + request.body.username);
        printLogMessage('--- PASSWORD : ' + request.body.password);

        var loginCallback = function (result) {
            if (result.code == 0) {//登录成功

                getUserInfo(result.userid, function (userInfo) {
                    setCookie(response, userInfo);//设置cookie
                    //response.redirect('back');//重定向到来时的页面
                    response.redirect('/');//重定向到首页
                    printLogMessage('登录成功');
                });
            } else {//登录失败
                response.render('login', {
                    errorMessage: result.message
                });
            }
        };

        var data = {
            username: request.body.username,
            password: request.body.password
        };

        printLogMessage('requestBody:' + JSON.stringify(request.body));
        printLogMessage('data:' + JSON.stringify(data));

        //将数据转发至业务服务器
        forwardRequestPOST(request.body, loginPath, loginCallback);
    }
};

// get
exports.onLogout = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        //跳转到主页
        clearCookie(response);//清空cookie
        response.redirect('/');
    }
};

// get
exports.manage = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        //跳转到管理页面
        var userId = getUserIdFromCookie(request);

        if (!userId || userId == '')
            redirectToLoginPage(response);
        else
        //设置用户名、信用等级
            getUserInfo(userId, function (result) {
                response.render('user', {
                    status: result.status,
                    name: result.name,
                    credit: result.credit
                });
            });
    }
};

/**
 * 返回用户信息
 * @param userId
 * @param onSucceedCallback 参数为完整的个人信息(包括userId)
 * @param onFailCallback 参数为message
 */
function getUserInfo(userId, onSucceedCallback) {
    //从业务服务器检索用户信息

    var path = '/user/' + userId + '/info';

    var callback = function (result) {
        //加入个人信息
        result.userId = userId;
        onSucceedCallback(result);

    };

    forwardRequestGET(path, callback);

}

// get
exports.showUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'get') {

        var userId = getUserIdFromCookie(request);
        var errorMessage = request.params.message;
        errorMessage = errorMessage ? errorMessage : '';

        printLogMessage('show user info : ' + userId);

        if (!userId || userId == '')
            redirectToLoginPage(response);
        else
        //设置用户名、信用等级
            getUserInfo(userId, function (result) {
                response.render('profile', {
                    username: result.username,
                    status: result.status,
                    sid: result.sid,
                    name: result.name,
                    phone: result.phone,
                    email: result.email,
                    credit: result.credit,
                    errorMessage: errorMessage
                });
            }, function (errorMessage) {
                //TODO 404页面

            });
    }
};

// post
exports.manageUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'post') {

        var userId = getUserIdFromCookie(request);
        var updatePath = '/user/' + userId + '/update';

        printLogMessage('---------------- manage user info : ' + userId + '  business path: ' + updatePath + '   request body = ' + JSON.stringify(request.body));
        printLogMessage('---------------- request headers : ' + JSON.stringify(request.headers));

        var callback = function (result) {
            if (result != null) {

                var errorMessage = result.code == 0 ? '更新成功' : '修改失败';

                getUserInfo(userId, function (userInfo) {
                    setCookie(response, userInfo);//更新cookie
                    //response.render('profile', {
                    //    username: userInfo.username,
                    //    status: userInfo.status,
                    //    sid: userInfo.sid,
                    //    name: userInfo.name,
                    //    phone: userInfo.phone,
                    //    email: userInfo.email,
                    //    credit: userInfo.credit,
                    //    errorMessage: errorMessage
                    //});
                    response.send(errorMessage);

                    printLogMessage('user info : ' + JSON.stringify(userInfo));
                    printLogMessage(errorMessage);
                });

            }
        };

        var data = {
            phone: request.body.phone,
            email: request.body.email,
            pre_pw: request.body.pre_pw,
            new_pw: request.body.new_pw
        };

        forwardRequestPOST(request.body, updatePath, callback);

    }
};

// get
exports.showReservationList = function (request, response) {
    if (request.method.toLowerCase() == 'get') {

        printLogMessage('show reservation list');
        var userId = getUserIdFromCookie(request);
        var message = request.params.message;
        message = message ? message : '';
        printLogMessage('show reservation list : userId=' + userId + '   message=' + message);

        if (!userId || userId == '')
            redirectToLoginPage(response);
        else
            showReservations(userId, message, response);
    }
};

/**
 * 显示用户的预约单
 * @param userId
 * @param message 可选
 * @param response
 */
function showReservations(userId, message, response) {

    var path = '/user/reservation/list?userid=' + userId;

    printLogMessage('reservation : ' + path);

    var callback = function (result) {
        if (result != null)
            printLogMessage('result:' + JSON.stringify(result));

        getUserInfo(userId, function (userInfo) {
            //渲染预约单界面
            response.render('reservation_list', {
                code: userInfo.code,
                username: userInfo.username,
                name: userInfo.name,
                status: userInfo.status,
                credit: userInfo.credit,
                reservations: result.reservations,
                message: userInfo.code == 0 ? message : ''
            });
        });

    };

    forwardRequestGET(path, callback);
}

/**
 * 从请求中读取cookie获得userId
 * @param request
 * @return 返回userId
 */
function getUserIdFromCookie(request) {

    var userInfo = request.cookies.userInfo;

    var result = typeof userInfo == 'undefined';
    printLogMessage('get userId from cookie : ' + result);

    if (result)
        return null;

    //从base64编码的cookie中解析userId
    return JSON.parse(new Buffer(userInfo, 'base64').toString()).userId;

    //return request.cookies.userId;
}

/**
 * 在header中设置cookie
 * cookie内包含完整的用户信息
 * @param response
 * @param userInfo 完整的个人信息(需带有userId)
 */
function setCookie(response, userInfo) {
    // 设置完整用户信息

    printLogMessage('set cookie user info : ' + JSON.stringify(userInfo));

    //对user info进行base64编码，
    var userInfoInBase64 = new Buffer(JSON.stringify(userInfo)).toString('base64');

    response.cookie('userInfo', userInfoInBase64, {
        expires: new Date(Date.now() + 900000000),
        path: '/'
    });
}

/**
 * 清空cookie
 * @param response
 */
function clearCookie(response) {
    response.clearCookie('userInfo', {path: '/'});
}