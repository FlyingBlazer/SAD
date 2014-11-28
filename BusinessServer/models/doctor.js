var orm = require('orm');

exports.setup = function(db) {
    return db.define("doctor", {
        id: {type: 'serial', mapsTo: 'doctor_id' },
        name: {type: 'text', size: 50, mapsTo: 'doctor_name', unique: true, required: true},
        info: {type: 'commonText', required: true, mapsTo: 'doctor_info'},
        title: {type: 'text', size: 200, required: true, mapsTo: 'doctor_title'},
        photo: {type: 'text', size: 200, required: true, mapsTo: 'doctor_photo'}
    }).hasOne('department', db.models.department, {reverse: 'doctors'});
};
