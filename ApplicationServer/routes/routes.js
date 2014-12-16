/**
 * Created by renfei on 14/12/5.
 */

var express = require('express');
var controllers = require('../controllers');
var router = express.Router();

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
router.route('/account/manage/reservation').get(controllers.user.showReservationList);

/* Reservation Workflow */

// Test
router.route('/test/:template/').get(controllers.reservation.test);

// Home page
router.route('/').get(controllers.home);

// Choose a location
// No view, just set cookie and redirect to home page (to choose a hospital)
router.route('/choose-location').get(controllers.reservation.chooseLocation);

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

// Confirm reservation
router.route('/concierge/reserve/confirm').post(controllers.reservation.confirm);

// Submit reserve request
router.route('/concierge/reserve/submit').post(controllers.reservation.onSubmit);

// Show reservation detail
// User may take actions like pay, print or close
// Optional message
router.route('/reservation/:doctor_id/:reservation_id').get(controllers.reservation.showReservation).post(controllers.reservation.operateReservation);

/**
 * =========================================================
 * |  SAD SmartBackstage (TM)                              |
 * =========================================================
 */

// Home of backstage
router.route('/backstage').get(controllers.backstage.home);

// Users identity check
router.route('/backstage/users').get(controllers.backstage.manageUsers);

// Manage hospitals
router.route('/backstage/hospitals').get(controllers.backstage.manageHospitals);

// Add a hospital
router.route('/backstage/hospital/add').get(controllers.backstage.addHospital);

// Add a dept
router.route('/backstage/hospital/:hospital_id/add-dept').get(controllers.backstage.addDept);

// Add a doctor
router.route('/backstage/dept/:dept_id/add-doctor').get(controllers.backstage.addDoctor);

// Review or edit a hospital
router.route('/backstage/hospital/:hospital_id').get(controllers.backstage.editHospital);

// Review or edit a dept
router.route('/backstage/dept/:dept_id').get(controllers.backstage.editDept);

// Review or edit a doctor
router.route('/backstage/doctor/:doctor_id').get(controllers.backstage.editDoctor);

// Edit calendar
router.route('/backstage/doctor/:doctor_id/calendar').get(controllers.backstage.editCalendar);

module.exports = router;