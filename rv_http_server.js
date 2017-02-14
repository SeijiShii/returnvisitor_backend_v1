var http = require('http');
var url = require('url');
var port = 1337;

var dbclient = require('./dbclient');
var ReturnVisitorUsers = require('./returnvisitor_users');
var users = new ReturnVisitorUsers(dbclient);

var server = http.createServer(function(req, res){

  var reqUrl = req.url;
  // queryをオブジェクトでtrue
  var path = url.parse(reqUrl, true);
  var pathname = path.pathname;
  var tmpArray = pathname.split('/');
  var pathArray = [];
  for (var i = 0 ; i < tmpArray.length; ++i){
    if (tmpArray[i] !== '') {
      pathArray.push(tmpArray[i]);
    }
  }
  var query = path.query;

  // メソッドで振り分ける
  switch (req.method) {
    case 'GET':
      doGet(req, res, pathArray, query);
      break;
    case 'POST':
      doPost(req, res, pathArray);
      break;
    case 'PUT':
      doPut(req, res, pathArray);
      break;
    case 'DELETE':
      doDelete(req, res, pathArray);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented method: ' + req.method);
      break;
  }
});

var doGet = function(req, res, pathArray, query) {
  // console.log('doGet called');

  // リソースで振り分ける
  var resourceRootName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceRootName) {
    case 'users':
      users.doGetUser(req, res, query);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in GET method.');
  }
}

var doPost = function(req, res, pathArray) {
  // console.log('doPost called');

  // リソースで振り分ける
  var resourceRootName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceRootName) {
    case 'users':
      users.doPostUser(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in POST method.');
  }
}

var doPut = function(req, res, pathArray) {
  // リソースで振り分ける
  var resourceRootName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceRootName) {
    case 'users':
      users.doPutUser(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in PUT method.');
  }
}

var doDelete = function(req, res, pathArray) {
  // リソースで振り分ける
  var resourceRootName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceRootName) {
    case 'users':
      users.doDeleteUser(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in PUT method.');
  }
}

server.listen(port, function(){
  console.log('Server listening on: ' + port);
});
