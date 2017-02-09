var http = require('http');
var url = require('url');
var port = 1337;

var dbclient = require('./dbclient');
var ReturnVisitorUsers = require('./returnvisitor_users');
var users = new ReturnVisitorUsers(dbclient);

var server = http.createServer(function(req, res){

  // メソッドで振り分ける
  switch (req.method) {
    case 'POST':
        doPost(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented method: ' + req.method);
      break;
  }


});

var doPost = function(req, res) {
  console.log('doPost called');

  var reqUrl = req.url;
  // console.log(reqUrl);

  var path = url.parse(reqUrl);
  // console.dir(path);

  var pathname = path.pathname;
  // console.log('pathname: ' + pathname);

  // pathArrayの空白要素を削除
  var tmpArray = pathname.split('/');
  var pathArray = [];
  for (var i = 0 ; i < tmpArray.length; ++i){
    if (tmpArray[i] !== '') {
      pathArray.push(tmpArray[i]);
    }
  }
  // console.dir(pathArray);

  // queryを抽出
  var query = reqUrl.query;

  // リソースで振り分ける
  var resourceName = pathArray.shift();
  // console.log(resourceName);
  switch (resourceName) {
    case 'users':
      doPostUser(req, res);
      break;
    default:
      res.writeHead(404, {'Content-type': 'text/plain'});
      res.end('Not Found: Not yet implemented resource: ' + resourceName);
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
      var jString = JSON.stringify(data);
      console.log('jString: ' + jString);
      res.end(jString);
    });
  });
}

server.listen(port, function(){
  console.log('Server listening on: ' + port);
});
