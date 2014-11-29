var restify = require('restify');
var server = exports = module.exports = restify.createServer();
var models = require('./models');
var orm = require('orm');
var settings = require('./lib/settings');
var controllers = require('./controllers');

server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: false,
    mapFiles: false
}));
server.use(orm.express(settings.dbUrl, models));

server.post('/user/login', controllers.user.login);



server.use(function(err, req, res, next) {
    if(err) {
        if(err.name == "SADError") {
            res.json({
                errcode: err.code,
                errmsg: err.message
            });
        } else if(err.name == "ORMError") {
            res.json({
                errcode: -1,
                errmsg: "ORM Error"
            });
        } else {
            res.json({
                errcode: -1,
                errmsg: "Internal error"
            })
        }
    }
});