var should = require('should'),
    fs = require('fs'),
    async = require('async'),
    knox = require('./index');

describe('Faux-Knox', function(){
  describe('API', function(){
    it('should have a createClient function', function(){
      knox.should.have.property('createClient').be.a('function');
    });
    it('should support methods', function(done){
      var client = knox.createClient();
      var methods = ['getFile', 'putFile', 'putBuffer', 'deleteFile'];
      function checker(method, callback){
        client.should.have.property(method).be.a('function');
        callback();
      }
      async.each(methods, checker, done);
    });
  });
  describe('Functional', function(){
    var client = knox.createClient({bucket:'./test_files'});
    it('should get a file', function(done){
      client.getFile('path/to/test.json', null, function(err, cres){
        cres.should.have.property('statusCode', 200);
        cres.should.have.property('headers').be.a('object');
        function getBuffer(callback){
          var buffer = "";
          cres.on('end', function(){
            callback(null, buffer);
          });
          cres.on('data', function(d){
            buffer = buffer + d.toString();
          });
        };
        function getFSFile(callback){
          fs.readFile('./test_files/path/to/test.json', callback);
        }
        async.parallel([getBuffer, getFSFile], function(err, results){
          should.strictEqual(results[0], results[1].toString());
          done();
        });
      });
    });
    it('should not get a file', function(done){
      client.getFile('path/to/nofile.txt', null, function(err, cres){
        cres.should.have.property('statusCode', 404);
        done();
      });
    });
  });
});
