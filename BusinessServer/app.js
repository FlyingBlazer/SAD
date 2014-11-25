var restify = require('restify');
var server = exports = module.exports = restify.createServer();

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

server.get('/hello/:name', respond);
server.head('/hello/:name', respond);