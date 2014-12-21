var orm = require('orm');

exports.setup = function(db) {
    return db.define("working", {
        id: {type: 'bigInt', required: true},
        date: {type: 'date', required: true},
        period: {type: 'integer', required: true},
        frequency: {type: 'text', size: 7, required: true},
        monday: {type: 'integer', required: true},
        tuesday: {type: 'integer', required: true},
        wednesday: {type: 'integer', required: true},
        thursday: {type: 'integer', required: true},
        friday: {type: 'integer', required: true},
        saturday: {type: 'integer', required: true},
        sunday: {type: 'integer', required: true}
    }).hasOne('doctor', db.models.doctor, {reverse: 'working'});
};
