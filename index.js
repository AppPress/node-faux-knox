var fs = require('fs');

exports.createClient = function(config){
  if (!config) config = {};
  if (!config.bucket) {
    config.bucket = './';
  } else {
    if (config.bucket[config.bucket.length - 1] !== '/') {
      config.bucket = config.bucket + '/';
    }
  }

  var client = {
    getFile: function(uri, headers, callback){
      var stream = fs.createReadStream(config.bucket + uri);
      stream.on('error', function(e){
        if(e.code === 'ENOENT') {
          return callback(null, {statusCode: 404});
        }
      });
      stream.on('readable', function(){
        stream.headers = headers;
        stream.statusCode = 200;
        callback(null, stream);
      });
    },
    putFile: function(){

    },
    putBuffer: function(){

    },
    deleteFile: function(){

    }
  };
  return client;
};


