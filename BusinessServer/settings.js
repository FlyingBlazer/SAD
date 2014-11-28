var fs = require('fs');

var settings = {};

exports.save = function() {
    fs.writeFileSync('./settings.json', JSON.stringify(this));
};

exports.load = function() {
    settings = {};

    var settingsFile = fs.readFileSync('./settings.json');
    settings = JSON.parse(settingsFile);
    for(var index in settings) {
        Object.defineProperty(module.exports, index, {
            value: settings[index],
            writable: true,
            configurable: false,
            enumerable: true
        });
    }

    if(typeof settings.dbUrl == "undefined") {
        Object.defineProperty(module.exports, 'dbUrl', {
            //writable: false,
            configurable: false,
            enumerable: true,
            get: function() {
                return encodeURIComponent(settings.db.server)
                    + "://" + encodeURIComponent(settings.db.username)
                    + (typeof settings.db.password != "undefined" ? ":" + encodeURIComponent(settings.db.password) : '')
                    + "@" + encodeURIComponent(settings.db.host)
                    + ":" + encodeURIComponent(settings.db.port)
                    + "/" + encodeURIComponent(settings.db.database);
            }
        });
    }
};