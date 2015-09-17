var _ = require('underscore');
var mkdirp = require('mkdirp');
var fs = require('fs');

module.exports.checkToPath = function checkToPath(to, cb) {
  var splitPath = to.split('/');
  var dirPath = _.initial(splitPath, 1).join('/');

  fs.exists(dirPath, function(exists){
    return exists ? cb() : mkdirp(dirPath, cb);
  });
};

module.exports.checkToPathSync = function checkToPathSync(to) {
  var splitPath = to.split('/');
  var dirPath = _.initial(splitPath, 1).join('/');

  if (!fs.existsSync(dirPath)) {
    mkdirp.sync(dirPath);
  }
};
