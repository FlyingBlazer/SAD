var orm = require('orm');

exports.setup = function(db) {
    return db.define("administrator", {
        id: {type: 'serial', mapsTo: 'administrator_id' },
        name: {type: 'text', size: 50, mapsTo: 'administrator_name', unique: true, required: true},
        password: {type: 'text', size: 150, mapsTo: 'administrator_pass', required: true},
        auth: {type: 'integer', mapsTo: 'administrator_auth', required: true}
    },{
        validations: {
            password: orm.enforce.ranges.length(6, 16, '密码长度请在6-16位之间')
        }
    });
};
