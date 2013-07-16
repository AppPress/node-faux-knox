var express = require('express'),
    http = require('http'),
    app = express(),
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
});
