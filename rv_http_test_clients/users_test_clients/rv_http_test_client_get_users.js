var request = require('request');
var options = {
  method: 'GET',
  url: 'http://localhost:1337/users/?user_name=seijishii&password=hogehoge',
  json: true
};

var assertBodyData = function(user) {
  try{
    user.user_name.should.equal('seijishii')
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }

  try{
    user.password.should.equal('hogehoge')
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }
}

request(options, function (error, response, body) {

  console.log('statusCode: ' + response.statusCode);
  console.dir(body);

  assertBodyData

  // try{
  //   response.statusCode.should.equal('200');
  //   assertBodyData(body);
  // } catch(err){
  //   console.log('--- AssertionError ---');
  //   console.log(err);
  //   console.log('--- stack trace ---');
  //   console.log(err.stack);
  // }
})
