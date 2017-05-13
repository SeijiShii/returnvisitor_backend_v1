// users
// id primary key (auto_increment)
// user_id varchar(100) これがあるおかげでuser_nameを変更しても一意性が保たれる
// user_name varchar(40)
// password varchar(40)
// updated_at varchar(30) mysqlにはtimestampという機能があるが、クライアント側でも使用するデータのためあえて文字列
// delete_flag tinyint(1) 要はboolean 実際に削除するのではなく削除判定とする。
//    deprecated!!

// ユーザー認証の流れ
//   user_nameとpasswordをGETで送る
//    ユーザ名は存在するか
//      YES ユーザ名存在する
//        パスワードは正しいか
//          YES   202 OK
//          NO    401 UNAUHTHORIZED
//      NO  ユーザ名存在しない  404 NOT FOUND
//
//    404 NOT FOUND が帰った場合：
//      UIにてユーザの作成を提案する。
//      POSTにてuser_nameとpasswordを送る
//        ユーザ名のフォーマットは正しいか（8文字以上）
//          YES フォーマット正しい
//            ユーザ名は存在するか
//              YES すでにそのユーザ名は存在する。　400 BAD REQUEST
//              NO  そのユーザ名は存在しない
//                パスワードのフォーマットをチェック（8文字以上）
//                  YES パスワードのフォーマット正しい
//                    ユーザを作成  201 CREATED　認証成功
//                  NO パスワードのフォーマット正しくない　400 BAD REQUEST
//           NO  フォーマット正しくない　400 BAD REQUEST


var _client;

function ReturnVisitorUsers(client) {
  _client = client;
}

var MESSAGE_HAS_USER_NAME = "HAS USER NAME";
var MESSAGE_NO_USER_NAME = "NO USER NAME";

var STATE_OK = '200 OK'
var MESSAGE_CREATED = "201 CREATED";
var MESSAGE_AUTHENTICATED = '202 AUTHENTICATED';
var ERROR_DUPLICATE_USER_NAME = '400 HAS DUPLICATE USER NAME';
var ERROR_SHORT_USER_NAME = "400 USER NAME TOO SHORT";
var ERROR_SHORT_PASSWORD = "400 PASSWORD TOO SHORT";
var MESSAGE_UNAUTHORIZED = "401 UNAUTHORIZED";
var ERROR_NOT_FOUND = '404 NOT FOUND';

ReturnVisitorUsers.prototype.getUser = function(user_name, password, callback) {

  // callback(result)
  // result {user, state}
  // データベースにuserが存在する場合、そのレコードを返す。
  // 存在しない場合、渡されたuser_nameだけを載せて返す。

  console.log('getUser called!');
  var queryGetData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '" AND password = "' + password + '";';
  console.log(queryGetData);
  _client.query(queryGetData, function(err, rows){
    console.dir(rows);
    var result = {
      user: {}
    };
    result.user.user_name = user_name;

    if (rows) {
      if (rows.info.numRows <= 0) {

        result.state = ERROR_NOT_FOUND;

      } else if(rows.info.numRows == 1){
        // データが1件だけの時のみデータを返す。
        result.state = STATE_OK;
        result.user = rows[0];

      } else {
        // ユーザ名が重複している
        // 本来なら同じ名前のユーザが存在する状態はPOSTで防止しなくてはならない。
        result.state = ERROR_DUPLICATE_USER_NAME;

      }
    } else {
      result.state = ERROR_NOT_FOUND;

    }
    console.log(result.state);
    callback(result);
  })
  _client.end();
}

ReturnVisitorUsers.prototype.hasUser = function(user_name, callback) {

  // callback(boolean exists)

  console.log('hasUser called!');
  console.log('Checking user with name: ' + user_name);

  var queryHasData = 'SELECT * FROM returnvisitor_db.users WHERE user_name = "' + user_name + '";';
  _client.query(queryHasData, function(err, rows){

    var exists, message;
    if (rows) {
      if (rows.info.numRows >= 1) {
        exists = true;
        message = MESSAGE_HAS_USER_NAME + ': ' + user_name
      } else {
        exists = false;
        message = MESSAGE_NO_USER_NAME + ': ' + user_name;
      }
      console.log(message);
      callback(exists);
    }
  });
  _client.end();
}

ReturnVisitorUsers.prototype.authenticate = function(user_name, password, callback) {

  // callback(result);
  // result {user, state, exists}
  // データベースにuserが存在する場合、そのレコードを返す。
  // 存在しない場合、渡されたuser_nameだけを載せて返す。

  ReturnVisitorUsers.prototype.hasUser(user_name, function(exists){

    if (exists) {
      // ユーザは存在する。
      ReturnVisitorUsers.prototype.getUser(user_name, password, function(result){

        // getUserを変更したのでいずれの場合もuserはnullではない。
        switch (result.state) {
          case STATE_OK:
            result.state = MESSAGE_AUTHENTICATED;
            break;

          case ERROR_DUPLICATE_USER_NAME:
            result.state = MESSAGE_UNAUTHORIZED;
            break;

          case ERROR_NOT_FOUND:
            result.state = MESSAGE_UNAUTHORIZED;
            break;

          default:

        }
        console.log(result.state);
        callback(result);
      });
    } else {
      // ユーザは存在しない
      var result = {
        user: {}
      };
      result.user.user_name = user_name;
      result.state = ERROR_NOT_FOUND;
      result.exists = false;
      console.log(result.state);
      callback(result);
    }
  });
}

// POSTが成功すればPOSTしたデータをオブジェクトで返す
ReturnVisitorUsers.prototype.postUser = function(user_name, password, callback) {

  // callback(result)
  // 成功時　user データを返す、state.exists = true
  //　失敗時　user.user_nameだけ、state.exists = false;

  ReturnVisitorUsers.prototype.hasUser(user_name, function(exists){
    var result = {};
    if (exists) {
      result.state = ERROR_DUPLICATE_USER_NAME;
      result.exists = false;

    } else {
      // ユーザ名は8文字以上か
      if (user_name.length < 8) {
        result.state = ERROR_SHORT_USER_NAME;
        result.exists = false;

      } else {

        // パスワードは8文字以上か
        if (password.length < 8) {
          result.state = ERROR_SHORT_PASSWORD;
          result.exists = false;

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
                ReturnVisitorUsers.prototype.getUser(user_name, password, function(result){
                  // メッセージをCREATEDに書き換える。
                  result.state = CREATED;
                  result.user = user;
                  callback(result);
                });
              }
            }
          });
        }
      }
      console.log(result.state);
      callback(result);
      _client.end();
    }
  });
}

ReturnVisitorUsers.prototype.putUser = function(user_name, password, new_user_name, new_password, callback){
  // callback(result)
  ReturnVisitorUsers.prototype.hasUser(user_name, function(exists){

    if (exists) {
      //ユーザ名が存在する。
      ReturnVisitorUsers.prototype.authenticate(user_name, password, function(result){
        if (result.state == 'MESSAGE_AUTHENTICATED') {
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
        } else {
          callback(result);
        }
      });
    } else {
      // ユーザー名がヒットしない
      callback(result);

    }
  });
}

ReturnVisitorUsers.prototype.doAuthentication = function(req, res, query) {

  console.dir(query);

  var user_name = query.user_name;
  console.log('user_name: ' + user_name);

  var password = query.password;
  console.log('password: ' + password);

  ReturnVisitorUsers.prototype.authenticate(user_name, password, function(result){

    var jsonString;
    switch (result.state) {
      case MESSAGE_AUTHENTICATED:
        res.writeHead(202, {'Content-type': 'application/json'});
        break;

      case MESSAGE_UNAUTHORIZED:
        res.writeHead(401, {'Content-type': 'application/json'});
        break;

      case ERROR_NOT_FOUND:
        res.writeHead(404, {'Content-type': 'application/json'});
        break;

      default:

    }
    jsonString = JSON.stringify(result);
    console.log('jsonString: ' + jsonString);
    res.end(jsonString);
  });
}

// 使い道が定まらないメソッド。そのうち削除すると思う。
// ReturnVisitorUsers.prototype.doGetUser = function(req, res, query) {
//
//   console.dir(query);
//
//   var user_name = query.user_name;
//   console.log('user_name: ' + user_name);
//
//   var password = query.password;
//   console.log('password: ' + password);
//
//   ReturnVisitorUsers.prototype.getUser(user_name, password, function(user, state){
//
//     console.log('data in getUser callback: ');
//     console.dir(user);
//
//     switch (result.state) {
//       case STATE_OK:
//         res.writeHead(200, {'Content-type': 'application/json'})
//         var jsonString = JSON.stringify(data);
//         console.log('jsonString: ' + jsonString);
//         res.end(jsonString);
//         break;
//       case ERROR_NOT_FOUND:
//         res.writeHead(404, {'Content-type': 'application/json'})
//         res.end(state);
//         break;
//       case ERROR_DUPLICATE_USER_NAME:
//         res.writeHead(400, {'Content-type': 'application/json'})
//         res.end(state);
//         break;
//       default:
//
//     }
//   });
// }

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

    ReturnVisitorUsers.prototype.postUser(user.user_name, user.password, function(result){

      console.log('data in postUser callback: ');
      console.dir(user);

      switch (result.state) {
        case CREATED:
          // ユーザが作成された。
          res.writeHead(201, {'Content-type': 'application/json'});
          var jsonString = JSON.stringify(data);
          console.log('jsonString: ' + jsonString);
          res.end(jsonString);
          break;

        case ERROR_DUPLICATE_USER_NAME:
        case ERROR_SHORT_USER_NAME:
        case ERROR_SHORT_PASSWORD:
          res.writeHead(400, {'Content-type': 'application/json'});
          var jsonString = JSON.stringify(state);
          console.log('jsonString: ' + jsonString);
          res.end(jsonString);
          break;

          break;
        default:

      }
    });
  });
}

//本格的な実装は少し先かな
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

    ReturnVisitorUsers.prototype.putUser(user.user_name, user.password, user.new_user_name, user.new_password, function(result){

      console.log('data in putUser callback: ');
      console.dir(data);

      // res.writeHead(200, {'Content-type': 'application/json'})
      // var jsonString = JSON.stringify(data);
      // console.log('jsonString: ' + jsonString);
      // res.end(jsonString);
    });
  });
}

module.exports = ReturnVisitorUsers;
