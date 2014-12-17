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
        response.render('signup');
    }
};

// post
exports.onRegister = function (request, response) {
    //接受并向业务服务器转发注册请求
    if (request.method.toLowerCase() == 'post') {

        //查找当前用户是否存在
        var requestBody = request.body;
        var username = requestBody.username;

        var checkPath = '/user/' + username + '/check';

        var registerCallback = function (result) {
            if (result != null) {

                if (result.errcode == 0) {//注册成功
                    // 跳转到用户个人主页
                    var userId = result.userid;
                    getUserInfo(userId, function (userInfo) {
                        setCookie(response, userInfo);//将个人信息写入cookie
                        // 跳转到user页面
                        response.render('user', {
                            name: userInfo.name,
                            status: userInfo.status,
                            credit: userInfo.credit
                        });
                    });
                } else {//注册失败
                    //提示错误信息
                    response.render('signup', {
                        errorMessage: result.errmsg
                    });
                }

            }
        };

        var checkCallback = function (checkResult) {
            if (checkResult != null) {
                if (checkResult.taken = false) {//未注册
                    forwardRequestPOST(requestBody, '/user/signup/', registerCallback);//注册
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
    forwardRequest('POST', path, data, callback);
}

/**
 * 向业务服务器转发请求
 * GET
 * @param path 业务服务器路径
 * @param callbacl 参数为业务服务器返回的结果(JSON Object)
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
    var options = {
        host: 'localhost',
        port: settings.port.business,
        method: method,
        path: path
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
                console.log('Cannot parse response data.');
                //console.error(e);
            }
            callback(srcObject);
        });
        res.on('error', function (e) {
            console.log('Business server is down: ' + e.message);
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

// post
exports.onLogin = function (request, response) {
    if (request.method.toLowerCase() == 'post') {
        var postData = request.body;
        var loginPath = '/user/login';

        var loginCallback = function (result) {
            if (result.errcode == 0) {//登录成功

                getUserInfo(result.userid, function (userInfo) {
                    setCookie(response, userInfo);//设置cookie
                    response.redirect('back');//重定向到来时的地址
                });
            } else {//登录失败
                response.render('login', {
                    errorMessage: '用户名或密码错误'
                });
            }
        };

        //将数据转发至业务服务器
        forwardRequestPOST(postData, loginPath, loginCallback);
    }
};

// get
exports.onLogout = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        //跳转到主页
        clearCookie(response);//清空cookie
        response.render('index');
    }
};

// get
exports.manage = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        //跳转到管理页面
        var userId = getUserIdFromCookie(request);

        if (userId == null || userId == '')
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
 * @param onSucceedCallback 参数为业务服务器返回的结果
 */
function getUserInfo(userId, onSucceedCallback) {
    //从业务服务器检索用户信息

    var path = '/user/' + userId + '/info';

    var callback = function (result) {
        if (result != null)
            if (result.errcode == 0) {
                onSucceedCallback(result);
            } else
                console.log(result.errmsg);
    };

    forwardRequestGET(path, callback());

}

// get
exports.showUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'get') {

        var userId = getUserIdFromCookie(request);
        if (userId == null || userId == '')
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
                    credit: result.credit
                });
            });
    }
};

// post
exports.manageUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'post') {

        var userId = getUserIdFromCookie(request);
        var updatePath = '/user/' + userId + '/update';

        var callback = function (result) {
            if (result != null) {
                if (result.errcode == 0) {
                    response.render('profile', {
                        errorMessage: '更新成功'
                    });
                } else {
                    response.render('profile', {
                        errorMessage: '修改失败'
                    });
                }
            }
        };

        forwardRequestPOST(request.body, updatePath, callback);

    }
};

// get
exports.showReservationList = function (request, response) {
    if (request.method.toLowerCase() == 'get') {

        var userId = getUserIdFromCookie(request);
        if (userId == null || userId == '')
            redirectToLoginPage(response);
        else
            showReservations(userId, response);
    }
};

/**
 * 显示用户的预约单
 * @param userId
 * @param response
 */
function showReservations(userId, response) {

    var path = '/user/reservation/list/?userid=' + userId;

    var callback = function (result) {
        if (result != null)
            if (result.errcode == 0) {
                getUserInfo(userId, function (userInfo) {
                    //渲染预约单界面
                    response.render('reservation_list', {
                        name: userInfo.name,
                        status: userInfo.status,
                        credit: userInfo.credit,
                        reservations: result.reservations
                    });
                });
            } else
                console.log(result.errmsg);
    };

    forwardRequestGET(path, callback);
}

/**
 * 从请求中读取cookie获得userId
 * @param request
 * @return 返回username
 */
function getUserIdFromCookie(request) {
    return request.cookies.userId;
}

/**
 * 在header中设置cookie
 * cookie内包含完整的用户信息
 * @param response
 * @param userInfo 完整的个人信息
 */
function setCookie(response, userInfo) {
    // 设置完整用户信息
    response.setHeader('Set-Cookie', ['userId=' + userInfo['userId'], 'username=' + userInfo['username'], 'userSocialId=' + userInfo['userSocialId'], 'userRealName=' + userInfo['userRealName'], 'userTelephone=' + userInfo['userTelephone']]);
}

/**
 * 清空cookie
 * @param response
 */
function clearCookie(response) {
    response.setHeader('Set-Cookie', '');
}