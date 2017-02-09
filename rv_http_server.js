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
      doGetUser(req, res, pathArray, query);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in GET method.');
  }
}

var doGetUser = function(req, res, pathArray, query) {

  var user_name = pathArray.shift();
  console.log('user_name: ' + user_name);

  console.dir(query);

  var password = query.password;
  console.log('password: ' + password);

  users.getUser(user_name, password, function(data, err){
    console.log('data in getUser callback: ');
    console.dir(data);

    res.writeHead(200, {'Content-type': 'application/json'})
    var jsonString = JSON.stringify(data);
    console.log('jsonString: ' + jsonString);
    res.end(jsonString);
  });
}

var doPost = function(req, res, pathArray) {
  // console.log('doPost called');

  // リソースで振り分ける
  var resourceRootName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceRootName) {
    case 'users':
      doPostUser(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceRootName + ' in POST method.');
  }
}

var doPostUser = function(req, res) {
  // bodyをゲット
  var body = [];
  req.on('data', function(chunk){
    body.push(chunk);
  }).on('end', function(){
    body = Buffer.concat(body).toString();
    // console.log('body: ' + body);
    var user = JSON.parse(body);
    // console.dir(user);
    // console.log('user.user_name: ' + user.user_name);
    // console.log('user.password: ' + user.password);

    users.postUser(user.user_name, user.password, function(data, err){

      console.log('data in postUser callback: ');
      console.dir(data);

      res.writeHead(200, {'Content-type': 'application/json'})
      var jsonString = JSON.stringify(data);
      console.log('jsonString: ' + jsonString);
      res.end(jsonString);
    });
  });
}

server.listen(port, function(){
  console.log('Server listening on: ' + port);
});
