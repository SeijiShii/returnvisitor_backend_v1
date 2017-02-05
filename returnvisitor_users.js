// users
// id primary key (auto_increment)
// user_id varchar(100) これがあるおかげでuser_nameを変更しても一意性が保たれる
// user_name varchar(40)
// password varchar(40)

var _client;
var crypto = require('crypto'),
  sha256sum = crypto.createHash('sha256');

function ReturnVisitorUsers(client) {
  _client = client;

}

ReturnVisitorUsers.prototype.getUser = function(user_name, password, callback) {

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


  // this.client.query()

  // no_data実装前テスト用処理
  // var err = {};
  // err.message = 'Method not yet implemented.'
  // callback(null, err);
}



ReturnVisitorUsers.prototype.hasUser = function(user_name, callback) {
  // 実装前テスト処理
  // データは存在するがfalseを返す
  // callback(false);

  var queryHasData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '";';
  _client.query(queryHasData, function(err, rows){

    console.dir(rows);

    var result = false;
    if (rows.info.numRows >= 1) {
      result = true;
    }
    callback(result);
  });
  _client.end();
}

ReturnVisitorUsers.prototype.isAuthenticated = function(user_name, password, callback) {

  var result = false;

  ReturnVisitorUsers.prototype.hasUser(user_name, function(result){

    // no_such_user_test前
    // var error = {};
    // error.message = 'No such user error not yet implemented';
    // callback(false, error);

    // no_such_user_test後
    if (!result) {
      // ユーザー名がヒットしない
      var err = {};
      err.message = 'No such user.'
      callback(null, err);
    } else {
      // wrong_password_test実装前
      // var err = {};
      // err.message = 'Wrong password test not yet implemented.'
      // callback(null, err);

      // wrong_password_test実装後
      ReturnVisitorUsers.prototype.getUser(user_name, password, function(data, err){
        if (data) {
          // var authResult = false;
          // auth_result_test実装前
          // callback(authResult, null);

          // auth_result_test実装後
          var authResult = true;
          console.log('Auth result: ' + authResult);
          callback(authResult, null);
        } else {
          var err1 = {};
          err1.message = 'Has such user but password is wrong.'
          console.log(err1.message);
          callback(false, err1);
        }

      });
    }
  });

}

// POSTが成功すればPOSTしたデータをオブジェクトで返す
ReturnVisitorUsers.prototype.postUser = function(user_name, password, callback) {
  // post_user_test実装前
  // callback(null, null);
  // post_user_test実装後

  // generate user_id
  var date = new Date();
  var dateString = date.toString();
  var idSeed = user_name + '_' + dateString;
  console.log('idSeed: ' + idSeed);
  sha256sum.update(idSeed);
  var user_id = sha256sum.digest('hex');
  console.log('user_id: ' + user_id);

  var queryPostData = 'INSERT INTO returnvisitor_db.users (user_name, password, user_id) VALUES ("' + user_name + '", "' + password + '", "' + user_id + '" );'
  console.log(queryPostData);
  _client.query(queryPostData, function(err, rows){
    if (rows.info.numRows == 1) {
      ReturnVisitorUsers.prototype.getUser(user_name, password, callback);
    }
  });
}

module.exports = ReturnVisitorUsers;
