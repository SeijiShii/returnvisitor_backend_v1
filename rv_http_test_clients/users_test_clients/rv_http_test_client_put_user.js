var request = require('request');
var should = require('should');

var options = {
  method: 'PUT',
  url: 'http://localhost:1337/users',
  json: true,
  headers: {
    'Content-type': 'application/json'
  },
  body: {user_name: 'seijishii',
          password: 'hogehoge',
          new_user_name: 'kintaro',
          new_password: 'fuwafuwa'}
};

request(options, function (error, response, body) {

  console.log('body: ' + body);
  // console.dir(error);
  // console.dir(response);

  var user = body;

  try{
    user.user_name.should.equal('kintaro');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }

  try{
    user.password.should.equal('fuwafuwa');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }


})
