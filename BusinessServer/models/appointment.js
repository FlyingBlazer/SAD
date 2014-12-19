var orm = require('orm');

exports.setup = function(db) {
    return db.define("appointment", {
        id: {type: 'serial'},
        time: {type: 'date', required: true},
        period: {type: 'tinyInt', required : true},
        status: {type: 'integer', required: true},
        price: {type: 'number', required: true},
        running_number: {type: 'text', size: 50, required: true, unique: true},
        record_time: {type: 'timestamp', required: true, defaultValue: '0000-00-00 00:00:00'}
    }).hasOne('user', db.models.user, {reverse: 'appointments'})
        .hasOne('doctor', db.models.doctor, {reverse: 'appointments'});
};
