var restify = require('restify');
var server = exports = module.exports = restify.createServer();
var models = require('./models');
var orm = require('orm');

server.use(restify.queryParser());
server.use(restify.gzipResponse());
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: false,
    mapFiles: false
}));
server.use(orm.express('mysql://root:yuzhan024@localhost/sad', models));

function respond(req, res, next) {
    req.models.administrator.find({}, function(err, admin) {
        if(err) throw err;
        console.log(admin[0].name, admin[0].password, admin[0].auth);
    });
    res.send('hello ' + req.params.name);
    next();
}

server.get('/login/:name/:pass', require('./controllers/user').login);

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.use(function(err, req, res, next) {
    if(err) res.json(err);
});