var restify = require('restify');
var server = exports = module.exports = restify.createServer();
var models = require('./models');
var orm = require('orm');
var settings = require('./lib/settings');
var controllers = require('./controllers');
var util = require('util');

server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: false,
    mapFiles: false
}));
server.use(orm.express(settings.dbUrl, models));

//--------------------------------
server.get('/user/check/list', controllers.user.check.list);
server.post('/user/check/:userId/approve', controllers.user.check.approve);
server.post('/user/check/:userId/reject', controllers.user.check.reject);
server.get('/user/check/:userId/status', controllers.user.check.status);
//---
server.get('/user/reservation/list', controllers.reservation.list);
server.post('/user/reservation/add', controllers.reservation.add);
server.get('/user/reservation/:hospitalId/detail', controllers.reservation.detail);
server.post('/user/reservation/:hospitalId/cancel', controllers.reservation.cancel);
server.post('/user/reservation/:hospitalId/pay', controllers.reservation.pay);
server.get('/user/reservation/:hospitalId/print', controllers.reservation.print);
//---
server.post('/user/login', controllers.user.login);
server.post('/user/signup', controllers.user.signUp);
server.get('/user/:username/check', controllers.user.checkName);
server.post('/user/:name/update', controllers.user.updateInfo);
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
server.get('/hospital/department/list', controllers.hospital.department.list);
server.post('/hospital/department/add', controllers.hospital.department.add);
server.get('/hospital/department/:departmentId/detail', controllers.hospital.department.detail);
server.get('/hospital/department/:departmentId/delete', controllers.hospital.department.remove);
server.post('/hospital/department/:departmentId/update', controllers.hospital.department.update);
//---
server.post('hospital/reservation/:reservationId/confirm', controllers.reservation.confirm);
//--------------------------------