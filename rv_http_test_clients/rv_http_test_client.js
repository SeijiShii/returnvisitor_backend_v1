var request = require('request');
var options = {
  url: 'http://localhost:1337/users?user_name=shiiseiji&password=hogehoge',
  json: true
};

request.get(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(body.name);
  } else {
    console.log('error: '+ response.statusCode);
    console.log('response.body: ' + response.body);
  }
})
