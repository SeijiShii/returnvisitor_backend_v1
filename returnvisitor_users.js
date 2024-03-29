// users
// id primary key (auto_increment)
// user_id varchar(100) これがあるおかげでuser_nameを変更しても一意性が保たれる
// user_name varchar(40)
// password varchar(40)
// updated_at varchar(30) mysqlにはtimestampという機能があるが、クライアント側でも使用するデータのためあえて文字列
// delete_flag tinyint(1) 要はboolean 実際に削除するのではなく削除判定とする。

var _client;

function ReturnVisitorUsers(client) {
  _client = client;

}

ReturnVisitorUsers.prototype.getUser = function(user_name, password, callback) {

  console.log('getUser called!');
  var queryGetData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '" AND password = "' + password + '" AND delete_flag = false ;';
  console.log(queryGetData);
  _client.query(queryGetData, function(err, rows){
    console.dir(rows);
    if (rows) {
      if (rows.info.numRows <= 0) {
        var err = {};
        err.message = 'No such data.'
        console.log(err.message);
        callback(null, err);
      } else if(rows.info.numRows == 1){
        // データが1件だけの時のみデータを返す。
        var user = rows[0];
        callback(user, null);
      } else {
        var err = {};
        err.message = 'Has multiple rows with the data.'
        console.log(err.message);
        callback(null, err);
      }
    }
  })
  _client.end();
}

ReturnVisitorUsers.prototype.hasUser = function(user_name, callback) {

  // callback(result, message)
  console.log('hasUser called!');
  console.log('Checking user with name: ' + user_name);

  var queryHasData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '" AND delete_flag = false;';
  _client.query(queryHasData, function(err, rows){

    if (rows) {
      if (rows.info.numRows >= 1) {
        var message = 'Has user with name: ' + user_name
        console.log(message);
        callback(true, message);
      } else {
        var message = 'Does not have user with name: ' + user_name;
        console.log(message);
        callback(false, message);
      }
    }
  });
  _client.end();
}

ReturnVisitorUsers.prototype.isAuthenticated = function(user_name, password, callback) {

  // callback(result, data, message);

  ReturnVisitorUsers.prototype.hasUser(user_name, function(result, message){

    if (!result) {
      callback(false, null, message);
    } else {
      ReturnVisitorUsers.prototype.getUser(user_name, password, function(data, err){
        if (data) {
          var message = 'Auth result: TRUE';
          console.log(message);
          callback(true, data, message);
        } else {
          var message = 'Has such user but password is wrong.'
          console.log(message);
          callback(false, null, message);
        }

      });
    }
  });

}

// POSTが成功すればPOSTしたデータをオブジェクトで返す
ReturnVisitorUsers.prototype.postUser = function(user_name, password, callback) {

  // callback(data, err)

  ReturnVisitorUsers.prototype.hasUser(user_name, function(result, message){
    if (result) {
      var err = {};
      err.message = 'Has duplicate named user.';
      console.log(err.message);
      callback(null, err);
    } else {
      // generate user_id
      var date = new Date();
      var dateString = date.getTime().toString();
      var user_id = 'user_id_' + user_name + '_' + dateString;
      console.log('user_id: ' + user_id);

      var queryPostData = 'INSERT INTO returnvisitor_db.users (user_name, password, user_id, updated_at) VALUES ("' + user_name + '", "' + password + '", "' + user_id + '",' + new Date().getTime().toString() + ' );'
      console.log(queryPostData);
      _client.query(queryPostData, function(err, rows){
        console.dir(err);
        if (rows) {
          if (rows.info.affectedRows == 1) {
            ReturnVisitorUsers.prototype.getUser(user_name, password, callback);
          }
        }
      });
      _client.end();
    }
  });
}

ReturnVisitorUsers.prototype.putUser = function(user_name, password, new_user_name, new_password, callback) {
  ReturnVisitorUsers.prototype.hasUser(user_name, function(result, message){

    if (!result) {
      // ユーザー名がヒットしない
      var err = {};
      err.message = message
      callback(null, err);
      return;
    } else {
      ReturnVisitorUsers.prototype.isAuthenticated(user_name, password, function(result, data, message){
        if (!result) {
          var err = {};
          err.message = message;
          callback(null, err);
        } else {
          var queryUpdateData = 'UPDATE returnvisitor_db.users SET user_name = "' + new_user_name + '", password = "' + new_password + '", updated_at = ' + new Date().getTime().toString() + ' WHERE user_name = "' + user_name + '" AND password = "' + password + '";';
          console.log(queryUpdateData);

          _client.query(queryUpdateData, function(err, rows){
            console.dir(err);
            if(rows) {
              if (rows.info.affectedRows == 1) {
                ReturnVisitorUsers.prototype.getUser(new_user_name, new_password, callback);
              }
            }
          });
          _client.end();
        }
      });
      return;
    }
  });
}

ReturnVisitorUsers.prototype.deleteUser = function(user_name, password, callback) {
  console.dir(callback);

  // ユーザー名の存在確認
  ReturnVisitorUsers.prototype.hasUser(user_name, function(result, message){
    if (!result) {
      callback(false, message);
    } else {

      // パスワードの照合
      ReturnVisitorUsers.prototype.isAuthenticated(user_name, password, function(result, data, message){
        if (!result) {
          callback(false, message);
        } else {

          // 削除(delete_flagをTRUEにする)
          var queryDeleteTrue = 'UPDATE returnvisitor_db.users SET delete_flag = true, updated_at = ' + new Date().getTime().toString() + ' WHERE user_name = "' + user_name + '" AND password = "' + password + '";'
          console.log(queryDeleteTrue);
          _client.query(queryDeleteTrue, function(err, rows){
            if (rows) {
              if (rows.info.affectedRows == 1) {
                var message = 'Successfully deleted data.'
                console.log(message);
                callback(true, message);
              }
            }
          });
          _client.end();
        }
      });
    }
  })
}

ReturnVisitorUsers.prototype.doGetUser = function(req, res, query) {

  console.dir(query);

  var user_name = query.user_name;
  console.log('user_name: ' + user_name);

  var password = query.password;
  console.log('password: ' + password);

  ReturnVisitorUsers.prototype.getUser(user_name, password, function(data, err){
    console.log('data in getUser callback: ');
    console.dir(data);

    res.writeHead(200, {'Content-type': 'application/json'})
    var jsonString = JSON.stringify(data);
    console.log('jsonString: ' + jsonString);
    res.end(jsonString);
  });
}

ReturnVisitorUsers.prototype.doPostUser = function(req, res) {
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

    ReturnVisitorUsers.prototype.postUser(user.user_name, user.password, function(data, err){

      console.log('data in postUser callback: ');
      console.dir(data);

      res.writeHead(200, {'Content-type': 'application/json'})
      var jsonString = JSON.stringify(data);
      console.log('jsonString: ' + jsonString);
      res.end(jsonString);
    });
  });
}

ReturnVisitorUsers.prototype.doPutUser = function(req, res) {
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

    ReturnVisitorUsers.prototype.putUser(user.user_name, user.password, user.new_user_name, user.new_password, function(data, err){

      console.log('data in putUser callback: ');
      console.dir(data);

      res.writeHead(200, {'Content-type': 'application/json'})
      var jsonString = JSON.stringify(data);
      console.log('jsonString: ' + jsonString);
      res.end(jsonString);
    });
  });
}

ReturnVisitorUsers.prototype.doDeleteUser = function(req, res) {
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

    ReturnVisitorUsers.prototype.deleteUser(user.user_name, user.password, function(result, message){

      var body = {};
      body.message = message;

      res.writeHead(200, {'Content-type': 'application/json'})
      var jsonString = JSON.stringify(body);
      console.log('jsonString: ' + jsonString);
      res.end(jsonString);
    });
  });
}

module.exports = ReturnVisitorUsers;
