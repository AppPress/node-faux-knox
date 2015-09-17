var should = require("should");
var fs = require("fs");
var async = require("async");
var rimraf = require("rimraf");
var knox = require("./index");

describe("Faux-Knox", function () {
	var client = knox.createClient({bucket:"./test_files"});

	describe("API", function () {
		it("should have a createClient function", function () {
			knox.should.have.property("createClient").and.be.a.Function;
		});
		it("should support methods", function (done) {
			var methods = ["getFile", "putFile", "putBuffer", "putStream", "deleteFile"];
			function checker(method, callback) {
				client.should.have.property(method).and.be.a.Function;
				callback();
			}
			async.each(methods, checker, done);
		});
	});
	describe("getFile", function () {
		it("should get a file", function (done) {
			client.getFile("path/to/test.json", null, function (err, cres) {
				cres.should.have.property("headers").and.be.a.Object;
				cres.should.have.property("statusCode", 200);
				function getBuffer(callback) {
					var buffer = "";
					cres.on("end", function () {
						callback(null, buffer);
					});
					cres.on("data", function (d) {
						buffer = buffer + d.toString();
					});
				}
				function getFSFile(callback) {
					fs.readFile("./test_files/path/to/test.json", callback);
				}
				async.parallel([getBuffer, getFSFile], function (err, results) {
					should.strictEqual(results[0], results[1].toString());
					done();
				});
			});
		});
		it("should not get a file", function (done) {
			client.getFile("path/to/nofile.txt", null, function (err, cres) {
				cres.should.have.property("statusCode", 404);
				done();
			});
		});
	});
	describe("putFile", function () {
		it("should put a file into bucket", function (done) {
			client.putFile("./test_files/put/fort_knox_tank.jpg", "from/fort/knox/super_tank.jpg", function (err, res) {
				res.should.have.property("headers").and.be.a.Object;
				res.should.have.property("statusCode", 200);
				fs.exists("./test_files/from/fort/knox/super_tank.jpg", function (existy) {
					should.strictEqual(existy, true);
					done();
				});
			});
		});
		it("should put a file into bucket with headers", function (done) {
			client.putFile("./test_files/put/fort_knox_tank.jpg", "from/fort/knox/super_tank_headers.jpg", {header: "value"}, function (err, res) {
				res.should.have.property("headers").and.be.a.Object;
				res.should.have.property("statusCode", 200);
				fs.exists("./test_files/from/fort/knox/super_tank_headers.jpg", function (existy) {
					should.strictEqual(existy, true);
					done();
				});
			});
		});
		it("should not put a file into bucket", function (done) {
			client.putFile("./i/dont/exists.txt", "/dev/null", function (err, res) {
				err.should.be.instanceOf(Error);
				err.should.have.property("code", "ENOENT");
				done();
			});
		});
	});
	describe("putBuffer", function () {
		it("should put a buffer where I tell it to", function (done) {
			var buff = new Buffer(4096);
			client.putBuffer(buff, "from/buffer/land/dev/null.text", {"Content-Type":"text/plain"}, function(err, res) {
				res.should.have.property("headers").and.be.a.Object;
				res.should.have.property("statusCode", 200);
				done();
			});
		});
	});
	describe("putStream", function () {
		it("should put a stream where I tell it to", function (done) {
			var readStream = fs.createReadStream("./test_files/path/to/test.json");
			// Faking content-length for now, but should probably test progress events
			var headers = {"Content-Length":"100"};
			client.putStream(readStream, 'path/to/stream/streamed.json', headers, function (err, res) {
				res.should.have.property("headers").and.be.a.Object;
				res.should.have.property("statusCode", 200);
				done();
			});
		});
	});
	describe("deleteFile", function () {
		before(function (done) {
			client.putFile("./test_files/put/fort_knox_tank.jpg", "to/a/new/path/here/tank.jpg", done);
		});
		it("should delete a file", function(done) {
			function fileExists(value, callback) {
				fs.exists("./test_files/to/a/new/path/here/tank.jpg", function (exists) {
					should.strictEqual(exists, value);
					callback();
				});
			}
			fileExists(true, function () {
				client.deleteFile("to/a/new/path/here/tank.jpg", function (err, res) {
					res.should.have.property("headers").and.be.a.Object;
					res.should.have.property("statusCode", 204);
					fileExists(false, done);
				});
			});
		});
		it("should not delete a file", function (done) {
			client.deleteFile("not/a/real/path.js", function (err, res) {
				res.should.have.property("headers").and.be.a.Object;
				res.should.have.property("statusCode", 404);
				done();
			});
		});
	});
	describe("copyFile", function () {
		before(function (done) {
			client.putFile("./test_files/put/fort_knox_tank.jpg", "to/a/new/path/here/tank.jpg", done);
		});
		it("should copy a file", function (done) {
			function fileExists(value, callback) {
				fs.exists("./test_files/to/a/new/path/here/tankCopy.jpg", function (exists) {
					should.strictEqual(exists, value);
					callback();
				});
			}
			fileExists(false, function () {
				client.copyFile("to/a/new/path/here/tank.jpg", "to/a/new/path/here/tankCopy.jpg", function (err, res) {
					res.should.have.property("headers").and.be.a.Object;
					res.should.have.property("statusCode", 200);
					fileExists(true, done);
				});
			});
		});
	});
	after(function (done) {
		async.each(["./test_files/from", "./test_files/to"], rimraf, done);
	});
	describe("list", function () {
		it("should list", function (done) {
			var opts = {prefix: "list/"};
			client.list(opts, function (err, page) {
				if (err) return done(err);
				var files = ['list/one', 'list/two'].map(function(file){
					var stats = fs.statSync('./test_files/'+file);
					return {Key: file, Size: stats.size, LastModified: stats.mtime};
				});
				page.Contents.should.eql(files);
				done();
			});
		});
		it("should join paths correctly", function (done) {
			var opts = {prefix: "list"};
			client.list(opts, function (err, page) {
				if (err) return done(err);
				var files = ['list/one', 'list/two'].map(function(file){
					var stats = fs.statSync('./test_files/'+file);
					return {Key: file, Size: stats.size, LastModified: stats.mtime};
				});
				page.Contents.should.eql(files);
				done();
			});
		});
		it("should list recursively", function (done) {
			var opts = {prefix: "list_nested"};
			client.list(opts, function (err, page) {
				if (err) return done(err);
				var files = ['list_nested/level/one', 'list_nested/level/two'].map(function(file){
					var stats = fs.statSync('./test_files/'+file);
					return {Key: file, Size: stats.size, LastModified: stats.mtime};
				});
				page.Contents.should.eql(files);
				done();
			});
		});
	});
});
