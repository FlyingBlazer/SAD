var orm = require('orm');

exports.setup = function(db) {
    return db.define("working", {
        id: {type: 'bigInt', required: true},
        date: {type: 'date', required: true},
        period: {type: 'integer', required: true},
        frequency: {type: 'text', size: 7, required: true},
        totalApp: {type: 'integer', required: true},
        remainApp: {type: 'integer', required: true}
    }).hasOne('doctor', db.models.doctor, {reverse: 'working'});
};
