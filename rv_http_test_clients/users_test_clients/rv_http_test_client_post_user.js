var request = require('request');
var should = require('should');

var options = {
  method: 'POST',
  url: 'http://127.0.0.1:1337/users',
  json: true,
  headers: {
    'Content-type': 'application/json'
  },
  body: {user_name: 'seijishii',
          password: 'hogehoge'}
};

request(options, function (error, response, body) {

  console.log('body: ' + body);
  console.dir(error);
  // console.dir(response);

  var user = body;

  try{
    user.user_name.should.equal('seijishii');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }

  try{
    user.password.should.equal('hogehoge');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }


})
