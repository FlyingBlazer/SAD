/**
 * Created by renfei on 14/12/6.
 */

/**
 * 渲染home.jade
 * @param request
 * @param response
 */
exports.home = function (request, response) {
    response.render('home');
};

/**
 * 渲染登录界面
 * @param request
 * @param response
 */
exports.login = function (request, response) {

};

// post
exports.onLogin = function (request, response) {

};

exports.logout = function (request, response) {

};

exports.changePassword = function (request, response) {

};

// post
exports.onChangePassword = function (request, response) {

};

exports.departments = function (request, response) {

};

exports.doctors = function (request, response) {

};

exports.reservations = function (request, response) {

};

exports.addDepartment = function (request, response) {

};

exports.addDoctor = function (request, response) {

};

/**
 * 输出log信息
 * 仅作调试之用
 * @param message
 */
function printLogMessage(message) {
    console.log(message);
}