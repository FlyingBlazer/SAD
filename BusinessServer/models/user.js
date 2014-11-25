/**
 * Created by zhugongpu on 14/11/25.
 */

var orm = require('orm');

exports.model = function(db) {
    return db.define("user", {
        id: { type: 'serial', key:true },
        username: { type: 'text' },
        password: { type: 'text' }
    },{
        validations: {
            username: orm.enforce.unique({ ignoreCase: true }, '用户名已存在'),
            password: orm.enforce.ranges.length(6, 16, '密码长度请在6-16位之间')
        }
    });
};
