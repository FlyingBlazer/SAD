var orm = require('orm');

exports.setup = function(db) {
    return db.define("department", {
        id: {type: 'serial', mapsTo: 'department_id'},
        name: {type: 'text', size: 200, required: true},
        info: {type: 'commonText', required: true},
        tel: {type: 'text', size: 200, required: true}
    }).hasOne('hospital', db.models.hospital, {reverse: 'departments'});
};
