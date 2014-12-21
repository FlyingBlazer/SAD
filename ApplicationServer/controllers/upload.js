var uuid = require('node-uuid');
var fs = require('fs');
var path = require('path');

exports.upload = function(req, res) {
    var file = req.file.picture[0];
    var name = uuid.v4();
    var ext = file.path.slice(file.path.lastIndexOf('.'));
    var newPath = path.join(__dirname, '../public/pictures',name+ext);
    var fileReadStream = fs.createReadStream(file.path);
    var fileWriteStream = fs.createWriteStream(newPath);
    fileReadStream.pipe(fileWriteStream);
    res.json({
        name: name+ext,
        originalName: file.originalFilename
    });
};