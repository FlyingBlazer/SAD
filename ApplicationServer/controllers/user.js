/**
 * Created by renfei on 14/12/6.
 */
var queryString = require('querystring');
var url = require('url');

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
        var postData = '';

        //接收数据块
        request.on('data', function (chunk) {
            postData += chunk;
        });

        request.on('end', function () {
            //查找当前用户是否存在
            var username = queryString.stringify(postData)['username'];
            forwardRequestGET('/user/' + username + '/check', function (checkResponse) {
                if (checkResponse.statusCode == 200) {
                    var checkFeedback = '';
                    checkFeedback.on('data', function (chunk) {
                        checkFeedback += chunk;
                    });

                    checkFeedback.on('end', function () {
                        var checkResult = queryString.parse(checkFeedback);

                        if (checkResult['errcode'] == 0) {
                            if (checkResult['taken'] == false) {//未注册
                                forwardRequestPOST(queryString.stringify(postData), '/user/signup', function (res) {//将请求转发到服务器
                                    if (res.statusCode == 200) {
                                        var feedback = '';//应用服务器返回的结果
                                        res.on('data', function (chunk) {
                                            feedback += chunk;
                                        });
                                        res.on('end', function () {
                                            var result = queryString.parse(feedback);
                                            if (result['errcode'] == 0) {//注册成功
                                                // 跳转到用户个人主页

                                                getUserInfo(username, function (userInfo) {
                                                    setCookie(response, userInfo);//将个人信息写入cookie
                                                    // 跳转到user页面
                                                    response.render('user', {
                                                        name: userInfo['name'],
                                                        status: userInfo['status'],
                                                        credit: userInfo['credit']
                                                    });
                                                });
                                            } else {//注册失败
                                                //提示错误信息
                                                response.render('signup', {
                                                    errorMessage: result['errmsg']
                                                });
                                            }
                                        });
                                    } else {//失败
                                        console.log(res.errmsg);
                                    }
                                });
                            } else {//账号已存在
                                response.render('signup', {
                                    errorMessage: '账号已存在'
                                });
                            }
                        } else
                            console.log(checkResult.errmsg);
                    });
                } else
                    console.log(checkResponse.errmsg);
            });
        });
    }
};

/**
 * 向业务服务器转发请求
 * POST
 * @param data
 * @param path 业务服务器路径
 * @param callback
 */
function forwardRequestPOST(data, path, callback) {
    var options = {
        host: 'localhost',
        method: 'POST',
        header: {
            "Content-Type": 'application/json',
            "Content-Length": data.length
        }
    };

    var req = http.request(options, path, callback);
    req.write(data);
    req.end();
}

/**
 * 向业务服务器转发请求
 * GET
 */
function forwardRequestGET(path, callback) {
    var options = {
        host: 'localhost',
        method: 'GET',
        header: {
            "Content-Type": 'application/json',
            "Content-Length": data.length
        }
    };
    http.request(options, path, callback);
}

// get
exports.loginPage = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
        response.render('login');
    }
};

// post
exports.onLogin = function (request, response) {
    if (request.method.toLowerCase() == 'post') {
        var postData = '';

        //接收数据块
        request.on('data', function (chunk) {
            postData += chunk;
        });

        request.on('end', function () {

            //将数据转发至业务服务器
            forwardRequestPOST(queryString.stringify(postData), '/user/login', function (res) {
                if (res.errcode == 200) {
                    var feedback = '';
                    res.on('data', function (chunk) {
                        feedback += chunk;
                    });

                    res.on('end', function () {
                        var result = queryString.parse(feedback);
                        if (result['errcode'] == 0) {//登录成功

                            getUserInfo(result['username'], function (userInfo) {
                                setCookie(response, userInfo);//设置cookie
                                var backURL = request.header('Referer') || '/';
                                response.redirect(backURL);//重定向到来时的地址
                            });
                        } else {//登录失败
                            response.render('login', {
                                errorMessage: '用户名或密码错误'
                            });
                        }
                    });
                } else
                    console.log(res.errmsg);
            })
        });
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
    if (request.method.toLowerCase() == 'get' && getUsernameFromCookie(request) != '') {
        //跳转到管理页面
        var username = getUsernameFromCookie(request);
        //设置用户名、信用等级
        getUserInfo(username, function (result) {
            response.render('user', {
                status: result['status'],
                name: result['name'],
                credit: result['credit']
            });
        });

    }
};

/**
 * 返回用户信息
 * @param username
 * @param onSucceedCallback 参数为userInfo
 */
function getUserInfo(username, onSucceedCallback) {
    //从业务服务器检索用户信息
    forwardRequestGET('/user/' + username + '/info', function (res) {
        if (res.errcode == 200) {
            var feedback = '';

            res.on('data', function (chunk) {
                feedback += chunk;
            });

            res.on('end', function () {
                var result = queryString.parse(feedback);
                if (result['errcode'] == 0) {//将结果返回到客户端
                    onSucceedCallback(result);
                } else {
                    console.log(result['errmsg']);
                }
            });

        } else
            console.log(res.errmsg);
    });
}

// get
exports.showUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'get' && getUsernameFromCookie(request) != '') {

        var username = getUsernameFromCookie(request);
        //设置用户名、信用等级
        getUserInfo(username, function (result) {
            response.render('profile', {
                username: result['username'],
                status: result['status'],
                sid: result['sid'],
                name: result['name'],
                phone: result['phone'],
                email: result['email'],
                credit: result['credit']
            });
        });
    }
};

// post
exports.manageUserInformation = function (request, response) {
    if (request.method.toLowerCase() == 'post' && getUsernameFromCookie(request) != '') {

        var username = getUsernameFromCookie(request);

        var postData = '';
        request.on('data', function (chunk) {
            postData += chunk;
        });

        request.on('end', function () {
            forwardRequestPOST(queryString.stringify(postData), '/user/' + username + '/update', function (res) {
                if (res.errcode == 200) {
                    var feedback = '';
                    res.on('data', function (chunk) {
                        feedback += chunk
                    });
                    res.on('end', function () {
                        var result = queryString.parse(feedback);
                        if (result['errcode'] == 0) {
                            response.render('profile', {
                                errorMessage: '更新成功'
                            });
                        } else {
                            response.render('profile', {
                                errorMessage: '修改失败'
                            });
                        }
                    })
                } else
                    console.log(res.errmsg);
            })
        });
    }
};

// get
exports.showReservationList = function (request, response) {
    if (request.method.toLowerCase() == 'get' && getUsernameFromCookie(request) != '') {

        var username = getUsernameFromCookie(request);

        var queryStirngURL = queryString.parse(request.url);
        c

        var params = 'user-id=' + username + '&time=' + queryStirngURL['time'] + '&hosipital-id=' + queryStirngURL['hosipital-id']
            + '&department-id=' + queryStirngURL['department-id'];

        showReservations(username, params, response);
    }
};

/**
 * 显示用户的预约单
 * @param username
 * @param params 带有用户名
 * @param response
 */
function showReservations(username, params, response) {
    forwardRequestGET('/user/reservation/list/?' + params, function (res) {
        if (res.errcode == 200) {
            var feedback = '';
            res.on('data', function (chunk) {
                feedback += chunk;
            });

            res.on('end', function () {
                //渲染预约单
                var result = queryString.parse(feedback);
                if (result.errcode == 0) {

                    getUserInfo(username, function (userInfo) {
                        //渲染预约单界面
                        response.render('reservation', {
                            name: userInfo['name'],
                            status: userInfo['status'],
                            credit: userInfo['credit'],
                            reservations: result['reservations']
                        });
                    });

                } else
                    console.log(res.errmsg);
            })
        } else
            console.log(res.errorMessage);
    });
}

/**
 * 从请求中读取cookie
 * @param request
 * @return 返回username
 */
function getUsernameFromCookie(request) {
    return queryString.parse(request.header.cookie)['username'];
}

/**
 * 在header中设置cookie
 * cookie内包含完整的用户信息
 * @param response
 * @param userInfo 完整的个人信息
 */
function setCookie(response, userInfo) {
    // 设置完整用户信息
    response.setHeader('Set-Cookie', ['username=' + userInfo['username'], 'id=' + userInfo['id'], 'name=' + userInfo['name'], 'phone=' + userInfo['phone'], 'email=' + userInfo['email']]);
}

/**
 * 清空cookie
 * @param response
 */
function clearCookie(response) {
    response.setHeader('Set-Cookie', '');
}
