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
          new_user_name: 'kunisada',
          new_password: 'mogomogo'}
};

request(options, function (error, response, body) {

  console.log('body: ' + body);
  // console.dir(error);
  // console.dir(response);

  var user = body;

  try{
    user.user_name.should.equal('kunisada');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }

  try{
    user.password.should.equal('mogomogo');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }


})
