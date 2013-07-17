faux-knox
=========

A mock knox wrapper

###Installation

`npm install faux-knox`

###Testing

`npm test` 
          
###API

```js
var knox = process.env.NODE_ENV === 'production'
           ? require('knox') : require('faux-knox');

var client = knox.createClient({
    bucket: 'local/filesystem/dir'
    //... other settings
});

//use client everywhere a regular knox client will be used.
```

####Implemented

#####getFile

```js
function(uri, headers, callback)

callback(err, cres)
```
`cres` is a readable stream with headers attached.

#####putFile

```js
function(from, to, callback)

callback(err, res)
```
`from` is the path to a local file to be read

`to` is the path to write the from bytes mounted in the bucket specified.

`res.headers.statusCode` is 201 on successful creation.

#####putBuffer

```js
function(buffer, to, headers, callback)

callback(err, res)
```
`buffer` is the buffer to write

`to` is where the buffer is written

`headers` used by knox module, ignored here

`res.headers.statusCode` is 201 on successful creation.

#####deleteFile

```js
function(file, callback)

callback(err, res)
```

`file` path in bucket to delete

`res.headers.statusCode` is 204 on successful deletion.

###TODO

All of the other [knox](https://github.com/LearnBoost/knox)
functionality

