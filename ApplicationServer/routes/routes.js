/**
 * Created by renfei on 14/12/5.
 */

var express = require('express');
var controllers = require('../controllers');
var router = express.Router();

router.get('/', controllers.home);

/**
 * =========================================================
 * |  Front End                                            |
 * =========================================================
 */

/* Users */

router.route('/account/register').get(controllers.user.register);

router.route('/account/login').get(controllers.user.login);

router.route('/account/manage').get(controllers.user.manage);

/* Reservation Workflow */

// Choose location
// see: http://www.apple.com/choose-your-country/
// redirect back to home page to choose a hospital

router.route('/choose-your-location').get(controllers.reservation.chooseLocation);

// Review hospital detail （incl. all depts)
// see: http://www.guahao.com/hospital/125336754304601

router.route('/hospital/:hospital_id').get(controllers.reservation.chooseDept);

// Start reservation, step 1 - choose a doctor
// see: http://www.guahao.com/department/126707963142052

router.route('/concierge/reserve/:hospital_id/:dept_id').get(controllers.reservation.chooseDoctor);

// Start reservation, step 2 - choose a time
// see: http://www.guahao.com/expert/0485132d-c95b-4623-8ff5-67aebce46c87?hospDeptId=126707963142052

router.route('/concierge/reserve/:hospital_id/:dept_id/:expert_id').get(controllers.reservation.chooseTime);

// Start reservation, step 3 - pay (optional)

router.route('/concierge/reserve/pay').get(controllers.reservation.pay);

// Start reservation, step 4 - show result

router.route('/reservation/:reservation_id').get(controllers.reservation.getReservationDetail);

/**
 * =========================================================
 * |  Back End                                             |
 * =========================================================
 */

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