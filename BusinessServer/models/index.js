exports.define = function(db, models, next) {
    db.settings.set('instance.cache', false);
    db.defineType('commonText', {
        datastoreType: function(prop) {
            return 'TEXT';
        },
        valueToProperty: function(value, prop) {
            return '' + value;
        },
        propertyToValue: function(value, prop) {
            return '' + value;
        }
    });
    db.defineType('bigInt', {
        datastoreType: function(prop) {
            return 'BIGINT(20)';
        },
        valueToProperty: function(value, prop) {
            return '' + value;
        },
        propertyToValue: function(value, prop) {
            return '' + value;
        }
    });
    db.defineType('timestamp', {
        datastoreType: function(prop) {
            return 'TIMESTAMP';
        },
        valueToProperty: function(value, prop) {
            return '' + value;
        },
        propertyToValue: function(value, prop) {
            return '' + value;
        }
    });
    db.defineType('tinyInt', {
        datastoreType: function(prop) {
            return 'tinyint(4)';
        },
        valueToProperty: function(value, prop) {
            return '' + value;
        },
        propertyToValue: function(value, prop) {
            return '' + value;
        }
    });
    models.user = require('./user').setup(db);
    models.administrator = require('./administrator').setup(db);
    models.hospital_rating = require('./hospital_rating').setup(db);
    models.hospital = require('./hospital').setup(db);
    models.department = require('./department').setup(db);
    models.doctor = require('./doctor').setup(db);
    models.appointment = require('./appointment').setup(db);
    models.working = require('./working').setup(db);
    db.sync(function(err) {
        if(err) {
            console.log(err.model);
            throw err;
        }
    });
    next();
};

