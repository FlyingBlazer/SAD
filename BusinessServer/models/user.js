var orm = require('orm');

exports.setup = function(db) {
    return db.define("user", {
        id: {type: 'bigInt'},
        name: {type: 'text', size: 50, unique: true, required: true},
        realName: {type: 'text', size: 20, required: true},
        password: {type: 'text', size: 50, required: true},
        tel: {type: 'text', size: 50, required: true},
        socialId: {type: 'text', size: 50, required: true, unique: true},
        credit: {type: 'integer', required: true},
        email: {type: 'text', size: 100, unique: true},
        isActivated: {type: 'boolean', required: true}
    });
};
