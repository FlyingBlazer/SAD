/**
 * Created by renfei on 14/12/6.
 */

var parseUserInfo = function(request) {
    return JSON.parse(new Buffer(request.cookies.userInfo, 'base64').toString('ascii'));
};

module.exports = function(request, response) {
    var userInfo = {};
    if (typeof request.cookies.userInfo !== 'undefined')
        userInfo = parseUserInfo(request);
    response.render('index', {
        username: userInfo.username ? userInfo.username : ''
    });
};