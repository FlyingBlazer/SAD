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

};

/**
 * 登出
 * 清空cookie，跳转到/login
 * @param request
 * @param response
 */
exports.logout = function (request, response) {


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

/**
 * 获得cookie
 * cookie 中所有的key已经去掉sb_
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