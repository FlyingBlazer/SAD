var orm = require('orm');

exports.setup = function(db) {
    return db.define("hospital_rating", {
        id: {type: 'serial'},
        meaning: {type: 'text', size: 50, required: true}
    });
};
