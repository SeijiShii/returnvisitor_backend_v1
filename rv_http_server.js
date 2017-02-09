var http = require('http');
var url = require('url');
var port = 1337;

var dbclient = require('./dbclient');

var pathArray, query;
var users = require('./returnvisitor_users');

var server = http.createServer(function(req, res){

  var reqUrl = req.url;
  console.log(reqUrl);

  var path = url.parse(reqUrl);
  console.dir(path);

  var pathname = path.pathname;
  console.log('pathname: ' + pathname);

  var pathArray = pathname.split('/');

  // pathArrayの空白要素を削除
  var tmpArray = [];
  for (var i = 0 ; i < pathArray.length; ++i){
    if (pathArray[i] !== '') {
      tmpArray.push(pathArray[i]);
    }
  }
  pathArray = [];
  for (var i = 0 ; i < tmpArray.length ; ++i) {
    pathArray.push(tmpArray[i]);
  }
  console.dir(pathArray);

  var query = reqUrl.query;

  // リソースで振り分ける
  var resourceName = pathArray.shift();
  console.log(resourceName);
  switch (resourceName) {
    // case 'users':
    //
    //   break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceName);
  }
});

server.listen(port, function(){
  console.log('Server listening on: ' + port);
});
