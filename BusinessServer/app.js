var restify = require('restify');
var server = restify.createServer();
var models = require('./models');
var orm = require('orm');
var settings = require('./lib/settings');
var controllers = require('./controllers');
var util = require('util');
var debug = require('debug')('business');

server.use(restify.queryParser({
    mapParams: false
}));
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: false,
    mapFiles: false
}));
server.use(orm.express(settings.dbUrl, models));

server.use(function(req, res, next) {
    res.charSet('utf-8');
    res.header('Access-Control-Allow-Origin', '*');
    debug("Request received: %s %s", req.method, req.url);
    debug("body: ", req.body);
    debug("query: ", req.query);
    debug("params: ", req.params);
    next();
});

//--------------------------------
server.get('/user/check/list', controllers.user.check.list);
server.post('/user/check/:userId/approve', controllers.user.check.approve);
server.post('/user/check/:userId/reject', controllers.user.check.reject);
server.get('/user/check/:userId/status', controllers.user.check.status);
//---
server.get('/user/reservation/list', controllers.reservation.list);
server.post('/user/reservation/add', controllers.reservation.add);
server.get('/user/reservation/:reservationId/detail', controllers.reservation.detail);
server.post('/user/reservation/:reservationId/cancel', controllers.reservation.cancel);
server.post('/user/reservation/:reservationId/pay', controllers.reservation.pay);
//---
server.post('/user/login', controllers.user.login);
server.post('/user/signup', controllers.user.signUp);
server.get('/user/:username/check', controllers.user.checkName);
server.post('/user/:userId/update', controllers.user.updateInfo);
server.get('/user/:userId/info', controllers.user.info);
//--------------------------------
server.get('/hospital/hospital/list', controllers.hospital.hospital.list);
server.post('/hospital/hospital/add', controllers.hospital.hospital.add);
server.get('/hospital/hospital/:hospitalId/detail', controllers.hospital.hospital.detail);
server.get('/hospital/hospital/:hospitalId/delete', controllers.hospital.hospital.remove);
server.post('/hospital/hospital/:hospitalId/update', controllers.hospital.hospital.update);
//---
server.get('/hospital/doctor/list', controllers.hospital.doctor.list);
server.post('/hospital/doctor/add', controllers.hospital.doctor.add);
server.get('/hospital/doctor/:doctorId/detail', controllers.hospital.doctor.detail);
server.get('/hospital/doctor/:doctorId/delete', controllers.hospital.doctor.remove);
server.post('/hospital/doctor/:doctorId/update', controllers.hospital.doctor.update);
//---
server.get('/hospital/doctor/:doctorId/working/getraw', controllers.hospital.doctor.working.getRaw);
server.get('/hospital/doctor/:doctorId/working/week/add', controllers.hospital.doctor.working.addWeek);
server.get('/hospital/doctor/:doctorId/working/week/update', controllers.hospital.doctor.working.updateWeek);
server.get('/hospital/doctor/:doctorId/working/temp/add', controllers.hospital.doctor.working.addTemp);
server.get('/hospital/doctor/:doctorId/working/temp/delete', controllers.hospital.doctor.working.deleteTemp);
//---
server.post('/hospital/department/add', controllers.hospital.department.add);
server.get('/hospital/department/:hospitalId', controllers.hospital.department.list);
server.get('/hospital/department/:departmentId/detail', controllers.hospital.department.detail);
server.get('/hospital/department/:departmentId/delete', controllers.hospital.department.remove);
server.post('/hospital/department/:departmentId/update', controllers.hospital.department.update);
//---
server.post('/hospital/reservation/:reservationId/confirm', controllers.reservation.confirm);
server.get('/reservation/:hospitalId/list', controllers.reservation.list_h);
//--------------------------------
server.get('/search', controllers.search);

server.on('uncaughtException', function(req, res, route, err) {
    debug("Uncaught exception occurred");
    debug("Request :");
    debug("\tHeaders :", req.headers);
    debug("\tUrl :", req.url);
    debug("\tMethod :", req.method);
    debug("Error: ", err);
    debug("Route: ", route);
    res.send(500, new Error('Internal error'));
});

exports = module.exports = server;