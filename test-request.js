
var request = require('request');
/*
function getConfiguration(){
  // Set the headers
  var headers = {
      'User-Agent':       'Super Agent/0.0.1',
      'Content-Type':     'application/json'
  }

  // Configure the request
  var options = {
      hostname: 'localhost',

      method: 'GET',
      headers: headers,
      qs: {'http_address': '127.0.0.1:', 'client_publicKey': "dkcbaksdbckasdvc43erd"}
  }

  // Start the request
  request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          // Print out the response body
          console.log(body);
      } else {
        console.log(error)
      }
  });
}

getConfiguration();

*/

request.post('http://localhost:8700/registerNode').form({http_address:'value', client_publicKey: 'value2'})