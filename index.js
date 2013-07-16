var fs = require('fs');

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

    Client.prototype.putFile = function(){}
    Client.prototype.putBuffer = function(){}
    Client.prototype.deleteFile = function(){}
  }
  return new Client(config);
};


