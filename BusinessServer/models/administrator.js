var orm = require('orm');

exports.setup = function(db) {
    return db.define("administrator", {
        id: {type: 'serial'},
        name: {type: 'text', size: 50, unique: true, required: true},
        password: {type: 'text', size: 50, required: true, mapsTo: 'pass'},
        auth: {type: 'integer', required: true}
    });
};
