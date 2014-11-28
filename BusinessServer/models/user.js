var orm = require('orm');

exports.setup = function(db) {
    return db.define("user", {
        id: {type: 'bigInt', mapsTo: 'user_id' },
        name: {type: 'text', size: 50, mapsTo: 'user_name', unique: true, required: true},
        password: {type: 'text', size: 150, mapsTo: 'user_password', required: true},
        tel: {type: 'text', size: 50, mapsTo: 'user_tel', required: true},
        socialId: {type: 'text', size: 50, mapsTo: 'user_socialid', required: true, unique: true},
        credit: {type: 'integer', mapsTo: 'user_credit', required: true},
        email: {type: 'text', size: 100, mapsTo: 'user_email', unique: true}
    },{
        validations: {
            password: orm.enforce.ranges.length(6, 16, '密码长度请在6-16位之间')
        }
    });
};
