var fs = require('fs');
var path = require('path');
var _ = require('lodash');

module.exports = {};

var settingsFile = fs.readFileSync(path.join(__dirname, "../settings.json"));
var settings = JSON.parse(settingsFile);
for(var index in settings) {
    Object.defineProperty(module.exports, index, {
        configurable: false,
        enumerable: true,
        get: function() {
            return _.cloneDeep(settings[index]);
        },
        set: function(value) {
            settings[index] = value;
            fs.writeFileSync(path.join(__dirname, "../settings.json"), JSON.stringify(this));
        }
    });
}

if(typeof settings.dbUrl == "undefined") {
    Object.defineProperty(module.exports, 'dbUrl', {
        configurable: false,
        enumerable: true,
        get: function() {
            return encodeURIComponent(settings.db.server)
                + "://" + encodeURIComponent(settings.db.username)
                + (typeof settings.db.password != "undefined" ? ":" + encodeURIComponent(settings.db.password) : '')
                + "@" + encodeURIComponent(settings.db.host)
                + (typeof settings.db.password != "undefined" ? ":" + encodeURIComponent(settings.db.port) : '')
                + "/" + encodeURIComponent(settings.db.database);
        }
    });
}