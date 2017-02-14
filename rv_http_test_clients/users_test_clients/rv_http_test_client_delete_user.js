var request = require('request');
var should = require('should');

var options = {
  method: 'DELETE',
  url: 'http://localhost:1337/users',
  json: true,
  headers: {
    'Content-type': 'application/json'
  },
  body: { user_name: 'kunisada',
          password: 'mogomogo'}
};

request(options, function (error, response, body) {

  console.log('body: ' + body);
  // console.dir(error);
  // console.dir(response);

  try{
    response.statusCode.should.equal(200);
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }

  try{
    body.message.should.equal('Successfully deleted data.');
  } catch(err){
    console.log('--- AssertionError ---');
    console.log(err);
    console.log('--- stack trace ---');
    console.log(err.stack);
  }


})
