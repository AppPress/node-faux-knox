var fs = require('fs'),
    async = require('async'),
    utils = require(__dirname + '/utils');

exports.createClient = function(config){
  function Client(config){
    if (!config) config = {};
    if (!config.bucket) {
      config.bucket = './';
    } else {
      if (config.bucket[config.bucket.length - 1] !== '/') {
        config.bucket = config.bucket + '/';
      }
    }
    Client.prototype.getFile = function(uri, headers, callback){
        var stream = fs.createReadStream(config.bucket + uri);
        function cancelLocalListeners(){
          stream.removeListener('error', bad);
          stream.removeListener('readable', good);
        }
        function bad(e){
          cancelLocalListeners();
          if(e.code === 'ENOENT') {
            return callback(null, {statusCode: 404});
          }
        }
        function good(){
          stream.headers = headers;
          stream.statusCode = 200;
          cancelLocalListeners();
          return callback(null, stream);
        }
        stream.on('error', bad);
        stream.on('readable', good);
    };

    Client.prototype.putFile = function(from, to, callback){
      function checkToPath(cb){
        utils.checkToPath(config.bucket + to, cb);
      }
      function checkFromPath(cb){
        fs.stat(from, cb);
      };
      async.series([checkFromPath, checkToPath], function(err){
        if (err) {
          return callback(err);
        }
        var r = fs.createReadStream(from),
            w = fs.createWriteStream(config.bucket + to);
        w.on('finish', function(){
          callback(null, {headers:{statusCode:201}});
        });
        w.on('error', function(e){
          callback(null, {headers:{statusCode:404}});
        });
        r.pipe(w);
      });
    }
    Client.prototype.putBuffer = function(buffer, to, headers, callback){
      utils.checkToPath(config.bucket + to, function(){
        fs.writeFile(config.bucket + to, buffer, function(err){
          if (err) {
            return callback(err);
          }
          return callback(null, {headers:{statusCode:201}});
        });
      });
    }
    Client.prototype.deleteFile = function(file, callback){
      fs.unlink(config.bucket + file, function(err){
        return callback(null, {headers:{statusCode: err ? 404 : 204}});
      });
    }
  }
  return new Client(config);
};


