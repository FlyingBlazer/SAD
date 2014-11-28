var orm = require('orm');

exports.setup = function(db) {
    return db.define("working", {
        id: {type: 'bigInt', mapsTo: 'working_id', required: true},
        workingDate: {type: 'date', required: true},
        startTime: {type: 'date', required: true, time: true},
        endTime: {type: 'date', required: true, time: true},
        totalApp: {type: 'integer', required: true},
        remainApp: {type: 'integer', required: true}
    }).hasOne('doctor', db.models.doctor, {reverse: 'working'});
};
