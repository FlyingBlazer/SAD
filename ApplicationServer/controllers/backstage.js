/**
 * Created by renfei on 14/12/6.
 */

exports.home = function (request, response) {

    response.render('sb_home');
};

exports.login = function (request, response) {

    response.render('sb_login');
};

// post
exports.onLogin = function (request, response) {

};

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

    var doctorId = '1';
    response.redirect('/backstage/doctor/' + doctorId + '/edit_schedule');
};