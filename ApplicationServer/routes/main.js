/**
 * Created by renfei on 14/12/5.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});

/**
 * =========================================================
 * |  Front End                                            |
 * =========================================================
 */

/* Users */

router.get('/account/register', function(req, res) {
    res.send('register');
});

router.get('/account/login', function(req, res) {
    res.send('login');
});

router.get('/account/manage', function(req, res) {
    res.send('manage account');
});

router.get('/user/:username', function(req, res) {
    res.send('detail for user ' + req.params['username']);
});

/* Reservation Workflow */

// 1. Choose location
// see: http://www.apple.com/choose-your-country/

router.get('/choose-your-location', function(req, res) {
    res.send('please choose location');
});

// 2. Review hospital detail （incl. all depts)
// see: http://www.guahao.com/hospital/125336754304601

router.get('/hospital/:hospital_id', function(req, res) {
    res.send('detail for hospital ' + req.params['hospital_id']);
});

// 3. Start reservation, step 1 - choose a doctor
// see: http://www.guahao.com/department/126707963142052

router.get('/concierge/reserve/:hospital_id/:dept_id', function(req, res) {
    res.send('concierge ( ' + req.params['hospital_id'] + ', ' + req.params['dept_id'] + ' )');
});

// 4. Start reservation, step 2 - choose a time
// see: http://www.guahao.com/expert/0485132d-c95b-4623-8ff5-67aebce46c87?hospDeptId=126707963142052

router.get('/concierge/reserve/:hospital_id/:dept_id/:expert_id', function(req, res) {
    res.send('concierge ( ' + req.params['hospital_id'] + ', ' + req.params['dept_id'] + ', ' + req.params['expert_id'] + ' )');
});

// 5. Start reservation, step 3 - pay (optional)

router.get('/concierge/reserve/pay', function(req, res) {
    res.send('pay');
});

// 6. Start reservation, step 4 - show result

router.get('/reservation/:reservation_id', function(req, res) {
    res.send('reservation detail');
});

/**
 * =========================================================
 * |  Back End                                             |
 * =========================================================
 */

router.get('/backstage', function(req, res) {

});

// Users identity check

router.get('/backstage/users', function(req, res) {

});

// Manage hospitals

router.get('/backstage/hospitals', function(req, res) {

});

// Add a hospital

router.get('/backstage/hospital/add', function(req, res) {

});

// Add a dept

router.get('/backstage/hospital/:hospital_id/add-dept', function(req, res) {

});

// Add a doctor

router.get('/backstage/dept/:dept_id/add-doctor', function(req, res) {

});

// Review or edit a hospital

router.get('/backstage/hospital/:hospital_id', function(req, res) {

});

// Review or edit a dept

router.get('/backstage/dept/:dept_id', function(req, res) {

});

// Review or edit a doctor

router.get('/backstage/doctor/:doctor_id', function(req, res) {

});

// Edit calendar

router.get('/backstage/doctor/:doctor_id/calendar', function(req, res) {

});

module.exports = router;