var orm = require('orm');

exports.setup = function(db) {
    return db.define("doctor", {
        id: {type: 'serial'},
        name: {type: 'text', size: 20, required: true},
        info: {type: 'commonText', required: true},
        title: {type: 'text', size: 50, required: true},
        photo: {type: 'text', size: 50, required: true}
    }).hasOne('department', db.models.department, {reverse: 'doctors'});
};
