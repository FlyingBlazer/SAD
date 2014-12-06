var orm = require('orm');

exports.setup = function(db) {
    return db.define("hospital", {
        id: {type: 'serial'},
        name: {type: 'text', size: 50, unique: true, required: true},
        province: {type: 'text', size: 50, required: true},
        city: {type: 'text', size: 50, required: true},
        addr: {type: 'text', size: 100, required: true},
        tel: {type: 'text', size: 50, required: true},
        info: {type: 'commonText', required: true},
        site: {type: 'text', size: 200, required: true}
    }).hasOne('rating', db.models.hospital_rating);
};
