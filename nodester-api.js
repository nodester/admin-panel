var http = require('http'),
		encode = require("./encoding");

// default functions
var options = {
  host: 'api.nodester.com',
  port: 80
};

// Generate Query parameters from params(json)
function generateQueryParams(params) {
	console.log('generating params');
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

// authorize user
function authorize(credentials, callback) {
	// options for credential checkin
	options.path = "/apps";
  options.headers = {"Authorization" : "Basic " + credentials};
	
	var req = http.request(options, function(res) {
	  console.log("got it");
	  (res.statusCode == "200") ? callback(true) : callback(false);
  });
  req.end();
}

// interface to nodester api
function request(method, path, data, credentials, callback) {
	var formatted_path =  "/" + path + generateQueryParams(data);
	console.log("formatted path ===> ", formatted_path);
	
	options.path = formatted_path;
  options.headers = {"Authorization" : "Basic " + credentials};
	options.method = method;
	
	var req = http.request(options, function(res) {
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
		res.on('data', function (chunk) {
			if(typeof(callback) == "function") {
				callback(chunk);
			}
	  });
	});
	req.end();
}

// Expose Library Methods
exports.request = request;
exports.authorize = authorize;