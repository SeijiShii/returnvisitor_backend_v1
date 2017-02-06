// users
// id primary key (auto_increment)
// user_id varchar(100) これがあるおかげでuser_nameを変更しても一意性が保たれる
// user_name varchar(40)
// password varchar(40)

var _client;

function ReturnVisitorUsers(client) {
  _client = client;

}

ReturnVisitorUsers.prototype.getUser = function(user_name, password, callback) {

  console.log('getUser called!');
  var queryGetData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '" AND password = "' + password + '";';
  console.log(queryGetData);
  _client.query(queryGetData, function(err, rows){
    console.dir(rows);
    if (rows.info.numRows <= 0) {
      var err = {};
      err.message = 'No such data.'
      callback(null, err);
    } else if(rows.info.numRows == 1){
      // データが1件だけの時のみデータを返す。
      var user = rows[0];
      callback(user, null);
    } else {
      var err = {};
      err.message = 'Has multiple rows with the data.'
      callback(null, err);
    }
  })
  _client.end();
}



ReturnVisitorUsers.prototype.hasUser = function(user_name, callback) {
  console.log('hasUser called!');
  console.log('Checking user with name: ' + user_name);

  var queryHasData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '";';
  _client.query(queryHasData, function(err, rows){

    console.log('In callback in hasUser:');
    console.dir(rows);

    if (rows.info.numRows >= 1) {
      console.log('Has user with name: ' + user_name);
      callback(true);
    } else {
      console.log('Does not have user with name: ' + user_name);
      callback(false);
    }
  });
  _client.end();
}

ReturnVisitorUsers.prototype.isAuthenticated = function(user_name, password, callback) {

  // callback(result, data, message);

  ReturnVisitorUsers.prototype.hasUser(user_name, function(result){

    if (!result) {
      // ユーザー名がヒットしない
      var message = 'No such user.'
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
  ReturnVisitorUsers.prototype.hasUser(user_name, function(result){
    console.log('result for has check: ' + result);
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

      var queryPostData = 'INSERT INTO returnvisitor_db.users (user_name, password, user_id) VALUES ("' + user_name + '", "' + password + '", "' + user_id + '" );'
      console.log(queryPostData);
      _client.query(queryPostData, function(err, rows){
        if (rows.info.affectedRows == 1) {
          ReturnVisitorUsers.prototype.getUser(user_name, password, callback);
        }
      });
      _client.end();
    }
  });
}

ReturnVisitorUsers.prototype.putUser = function(user_name, password, new_user_name, new_password, callback) {
  ReturnVisitorUsers.prototype.hasUser(user_name, function(result){

    if (!result) {
      // ユーザー名がヒットしない
      var err = {};
      err.message = 'No such user.'
      callback(null, err);
      return;
    } else {
      ReturnVisitorUsers.prototype.isAuthenticated(user_name, password, function(result, data, message){
        if (!result) {
          var err = {};
          err.message = message;
          callback(null, err);
        } else {
          var queryUpdateData = 'UPDATE returnvisitor_db.users SET user_name = "' + new_user_name + '", password = "' + new_password + '" WHERE user_name = "' + user_name + '" AND password = "' + password + '";';
          console.log(queryUpdateData);

          _client.query(queryUpdateData, function(err, rows){
            console.dir(err);

            if (rows.info.affectedRows == 1) {
              ReturnVisitorUsers.prototype.getUser(new_user_name, new_password, callback);
            }
          });
          _client.end();
        }
      });
      return;
    }
  });
}

module.exports = ReturnVisitorUsers;
