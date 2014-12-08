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
        request.on('data', function (chunck) {
            postData += chunck;
        });

        request.on('end', function () {
            forwardRequest(queryString.stringify(postData), '/user/signup', function (res) {//TODO 路径
                if (res.statusCode == 200) {
                    var feedback = '';
                    res.on('data', function (chunck) {
                        feedback += chunck;
                    });
                    res.on('end', function () {
                        var result = queryString.parse(feedback);
                        if (result['errcode'] == 0) {//注册成功
                            //TODO 跳转到用户个人主页
                            response.render('user');
                        } else {//注册失败
                            //TODO 提示错误信息 [hbs文件也要修改]
                            response.render('signup', {
                                errorMessage: result['errmsg']
                            });
                        }
                    });
                } else {//失败
                    console.log(res.errmsg);
                }
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
function forwardRequest(data, path, callback) {
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
        request.on('data', function (chunck) {
            postData += chunck;
        });

        request.on('end', function () {
            var params = queryString.parse(postData);
            //TODO 解释表单数据部分
            params['username'];
            params['password'];
        });
    }
};

// get
exports.onLogout = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
//TODO 跳转到主页
    }
};

// get
exports.manage = function (request, response) {
    if (request.method.toLowerCase() == 'get') {
//TODO 跳转到管理页面
    }
};

// get
exports.showUserInformation = function (request, response) {

};

// post
exports.manageUserInformation = function (request, response) {

};

// get
exports.showReservationList = function (request, response) {

};