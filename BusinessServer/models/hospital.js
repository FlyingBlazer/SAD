var orm = require('orm');

exports.setup = function(db) {
    return db.define("hospital", {
        id: {type: 'serial', mapsTo: 'hospital_id' },
        name: {type: 'text', size: 50, mapsTo: 'hospital_name', unique: true, required: true},
        city: {type: 'text', size: 50, mapsTo: 'hospital_city', required: true},
        addr: {type: 'text', size: 100, required: true, mapsTo: 'hospital_addr'},
        tel: {type: 'text', size: 50, required: true, mapsTo: 'hospital_tel'},
        site: {type: 'text', size: 200, required: true, mapsTo: 'hospital_site'}
    }).hasOne('level', db.models.hospitalLevel);
};
