var _ = require('underscore'),
    mkdirp = require('mkdirp'),
    fs = require('fs');

function checkToPath(to, cb){
  var splitPath = to.split('/');
  var dirPath = _.initial(splitPath, 1).join('/');
  fs.exists(dirPath, function(exists){
    return exists ? cb() : mkdirp(dirPath, cb);
  });
}

exports.checkToPath = checkToPath;
