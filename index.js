var fs = require("fs");
var async = require("async");
var utils = require(__dirname + "/utils");

var Client = module.exports = function (config) {
	config = this.config = config || {};

	if (!config.bucket) {
		config.bucket = "./";
	} else {
		if (config.bucket[config.bucket.length - 1] !== "/") {
			config.bucket = config.bucket + "/";
		}
	}
};

Client.prototype.getFile = function(uri, headers, callback) {
	var self = this;

	if (!callback && typeof(headers) == "function") {
		callback = headers;
		headers = {};
	}
	var stream = fs.createReadStream(self.config.bucket + uri);
	function cancelLocalListeners() {
		stream.removeListener("error", bad);
		stream.removeListener("readable", good);
	}
	function bad(e) {
		cancelLocalListeners();
		if(e.code === "ENOENT") {
			stream.statusCode = 404;
			stream.headers = {};
			return callback(null, stream);
		}
	}
	function good() {
		stream.headers = {};
		stream.statusCode = 200;
		cancelLocalListeners();
		return callback(null, stream);
	}
	stream.on("error", bad);
	stream.on("readable", good);
};

Client.prototype.putFile = function(from, to, callback) {
	var self = this;

	async.series([function (cb) {
		utils.checkToPath(self.config.bucket + to, cb);
	}, function (cb) {
		fs.stat(from, cb);
	}], function(err) {
		if (err) {
			return callback(err);
		}
		var r = fs.createReadStream(from),
				w = fs.createWriteStream(self.config.bucket + to);
		w.on("finish", function() {
			callback(null, {headers:{}, statusCode:201});
		});
		w.on("error", function(e) {
			callback(null, {headers:{}, statusCode:404});
		});
		r.pipe(w);
	});
};
Client.prototype.putBuffer = function(buffer, to, headers, callback) {
	var self = this;

	utils.checkToPath(self.config.bucket + to, function() {
		fs.writeFile(self.config.bucket + to, buffer, function(err) {
			if (err) {
				return callback(err);
			}

			return callback(null, {headers:{}, statusCode:201});
		});
	});
};
Client.prototype.deleteFile = function(file, callback) {
	var self = this;

	fs.unlink(self.config.bucket + file, function(err) {
		return callback(null, {headers:{}, statusCode: err ? 404 : 204});
	});
};

module.exports.createClient = function(config) {
	return new Client(config);
};


