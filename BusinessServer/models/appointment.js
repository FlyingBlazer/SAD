var orm = require('orm');

exports.setup = function(db) {
    return db.define("appointment", {
        id: {type: 'serial'},
        pay_method: {type: 'integer', required: true},
        time: {type: 'timestamp', required: true},
        status: {type: 'integer', required: true},
        price: {type: 'number', required: true},
        running_number: {type: 'text', size: 200, required: true, unique: true},
        record_time: {type: 'timestamp', required: true, defaultValue: '0000-00-00 00:00:00'}
    }).hasOne('user', db.models.user, {reverse: 'appointments'})
        .hasOne('doctor', db.models.doctor, {reverse: 'appointments'});
};
