var express = require('express'),
    should = require('should'),
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
        done();
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
