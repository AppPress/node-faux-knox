var _ = require('underscore');
var mkdirp = require('mkdirp');
var fs = require('fs');

var checkToPath = module.exports.checkToPath = function (to, cb) {
	var splitPath = to.split('/');
	var dirPath = _.initial(splitPath, 1).join('/');

	fs.exists(dirPath, function(exists){
		return exists ? cb() : mkdirp(dirPath, cb);
	});
}
