var orm = require('orm');

exports.setup = function(db) {
    return db.define("hospitalLevel", {
        id: {type: 'serial', mapsTo: 'level_id' },
        meaning: {type: 'text', size: 50, required: true}
    });
};
