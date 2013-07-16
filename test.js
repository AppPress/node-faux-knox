var should = require('should'),
    fs = require('fs'),
    async = require('async'),
    rimraf = require('rimraf'),
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
  describe('getFile', function(){
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
  describe('putFile', function(){
    var client = knox.createClient({bucket:'./test_files'});
    it('should put a file into bucket', function(done){
      client.putFile('./test_files/put/fort_knox_tank.jpg', 'from/fort/knox/super_tank.jpg', function(err, res){
        res.should.have.property('headers');
        res.headers.should.have.property('statusCode', 201);
        fs.exists('./test_files/from/fort/knox/super_tank.jpg', function(existy){
          existy.should.be.true;
          done();
        });
      });
    });
    it('should not put a file into bucket', function(done){
      client.putFile('./i/dont/exists.txt', '/dev/null', function(err, res){
        err.should.have.property('code', 'ENOENT');
        done();
      });
    });
    after(function(done){
      rimraf('./test_files/from', done);
    });
  });
});
