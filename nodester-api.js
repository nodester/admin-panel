var http = require('http'),
		encode = require("./encoding");

// Generate Query parameters from params(json)
function generateQueryParams(params) {
  tail = [];
  for (var p in params) {
    if (params.hasOwnProperty(p)) {
      tail.push(p + "=" + encodeURIComponent(params[p]));
    }
  }
	if(tail.length > 0)
  	return "?" + tail.join("&");
	else
		return "";
}

// Proxy to api.nodester.com 
function request(method, path, data, credentials, callback) {
	var formattedPath =  "/" + path + generateQueryParams(data);
	console.log("formatted path ===> ", formattedPath);
	var options = {
	  host: 'api.nodester.com',
	  port: 80,
	  path: formattedPath,
		headers: {"Authorization" : "Basic " + encode.base64(credentials.user + ":" + credentials.pass)},
		method: method
	};
	
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
		res.on('data', function (chunk) {
			if(typeof(callback) == "function")
				callback(chunk);
	  });
	});
	req.end();
}

exports.request = request;