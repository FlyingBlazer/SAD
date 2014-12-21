/**
 * Created by renfei on 14/12/5.
 */

var express = require('express');
var controllers = require('../controllers');
var router = express.Router();
var multiparty = require('multiparty');

/**
 * =========================================================
 * |  Front End                                            |
 * =========================================================
 */

/* Users */

router.route('/account/register').get(controllers.user.registerPage).post(controllers.user.onRegister);
router.route('/account/login').get(controllers.user.loginPage).post(controllers.user.onLogin);
router.route('/account/logout').get(controllers.user.onLogout);
router.route('/account/manage').get(controllers.user.manage);
router.route('/account/manage/info').get(controllers.user.showUserInformation).post(controllers.user.manageUserInformation);
router.route('/account/manage/info/m/:message').get(controllers.user.showUserInformation);
router.route('/account/manage/reservation').get(controllers.user.showReservationList);
router.route('/account/manage/reservation/m/:message').get(controllers.user.showReservationList);

/* Reservation Workflow */

// Test
router.route('/test/:template/').get(controllers.reservation.test);

// Home page
router.route('/').get(controllers.home);

// Choose a location
// No view, just set cookie and redirect to home page (to choose a hospital)
router.route('/choose-location/:province').get(controllers.reservation.chooseLocation);

// ----->>>>

// Confirm reservation
router.route('/concierge/reserve-confirm').post(controllers.reservation.confirm);

// Submit reserve request
router.route('/concierge/reserve-submit').post(controllers.reservation.onSubmit);

// ----->>>>

// List hospitals - Show a list of all hospitals in user's city
// Choose a hospital
router.route('/hospitals').get(controllers.reservation.redirectToListHospitals);
router.route('/:province/hospitals').get(controllers.reservation.listHospitals);

// Hospital page - Show all departments and doctors
// Choose a department and a doctor
router.route('/concierge/reserve/:hospital_id').get(controllers.reservation.showHospital);

// Doctor page - Show doctor's detail and available time slots
// Choose a time
router.route('/concierge/reserve/:hospital_id/:department_id/:expert_id').get(controllers.reservation.showDoctor);
router.route('/concierge/reserve/:hospital_id/:department_id/:expert_id/:err_code').get(controllers.reservation.showDoctor);

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
router.route('/reservation/:reservation_id').get(controllers.reservation.showReservation);
router.route('/reservation/:reservation_id/m/:message').get(controllers.reservation.showReservation);
router.route('/reservation/:reservation_id/manage/pay').get(controllers.reservation.pay);
router.route('/reservation/:reservation_id/manage/cancel').get(controllers.reservation.cancel);
router.route('/reservation/:reservation_id/manage/print').get(controllers.reservation.print);

// Search
router.route('/search/:q').get(controllers.reservation.search);

/**
 * =========================================================
 * |  SAD SmartBackstage (TM)                              |
 * =========================================================
 */

router.route('/backstage').get(controllers.backstage.home);

// account
router.route('/backstage/login').get(controllers.backstage.login).post(controllers.backstage.onLogin);
router.route('/backstage/login/:initTimestamp/:msgType/:message').get(controllers.backstage.login);
router.route('/backstage/logout').get(controllers.backstage.logout);
router.route('/backstage/account').get(controllers.backstage.changePassword).post(controllers.backstage.onChangePassword);
router.route('/backstage/account/:initTimestamp/:msgType/:message').get(controllers.backstage.changePassword);

// query
router.route('/backstage/users').get(controllers.backstage.users);
router.route('/backstage/users/:initTimestamp/:msgType/:message').get(controllers.backstage.users);

router.route('/backstage/manage-hospitals').get(controllers.backstage.hospitals);
router.route('/backstage/manage-hospitals/:initTimestamp/:msgType/:message').get(controllers.backstage.hospitals);
router.route('/backstage/departments').get(controllers.backstage.departments);
router.route('/backstage/departments/:initTimestamp/:msgType/:message').get(controllers.backstage.departments);
router.route('/backstage/doctors').get(controllers.backstage.doctors);
router.route('/backstage/doctors/:initTimestamp/:msgType/:message').get(controllers.backstage.doctors);
router.route('/backstage/reservations').get(controllers.backstage.reservations);
router.route('/backstage/doctor/:id/edit_schedule').get(controllers.backstage.editSchedule);

// add
router.route('/backstage/api/add/department').post(controllers.backstage.addDepartment);
router.route('/backstage/api/add/doctor').post(controllers.backstage.addDoctor);
router.route('/backstage/api/add/hospitals').post(controllers.backstage.addHospital);

// file upload
router.route('/upload').all(function(req, res, next) {
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
        for(var index in fields) {
            req.body[index] = fields[index];
        }
            req.file = files;
        next(err);
    });
}).post(controllers.upload.upload);

module.exports = router;
