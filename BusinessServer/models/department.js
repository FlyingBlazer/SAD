var orm = require('orm');

exports.setup = function(db) {
    return db.define("department", {
        id: {type: 'serial'},
        name: {type: 'text', size: 50, required: true},
        info: {type: 'commonText', required: true},
        tel: {type: 'text', size: 50, required: true}
    }, {
        autoFetch: true,
        autoFetchLimit: 5
    }).hasOne('hospital', db.models.hospital, {reverse: 'departments'});
};
