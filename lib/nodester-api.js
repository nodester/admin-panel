var http = require('http'),
	encode = require("./encoding"),
	HOST = "api.nodester.com",
	PORT = 80;
// Generate Query parameters from params(json)
function generateQueryParams(params) {
	console.log('generating params');
	tail = [];
	for (var p in params) {
		if (params.hasOwnProperty(p)) {
			tail.push(p + "=" + encodeURIComponent(params[p]));
		}
	}
	if (tail.length > 0) return tail.join("&");
	else return "";
}

// authorize user
function authorize(credentials, callback) {
	// options for credential checkin
	var options = {
		host: HOST,
		port: PORT
	};
	options.path = "/apps";
	options.headers = {
		"Authorization": "Basic " + credentials
	};

	var req = http.request(options, function(res) {
		console.log("got it");
		(res.statusCode == "200") ? callback(true) : callback(false);
	});
	req.end();
}

// interface to nodester api
function request(method, path, data, credentials, callback) {
	var queryString = generateQueryParams(data);
	var formattedPath = "/" + path + ((method == "GET" && queryString.length > 0) ? "?" + queryString : "");

	if (method == 'DELETE' && formattedPath == '/app') {
		formattedPath = '/app/' + data.appname;
		queryString = '';
		data = '';
	}
	if (method == 'DELETE' && formattedPath == '/appdomains') {
		formattedPath = '/appdomains/' + data.appname + '/' + data.domain;
		queryString = '';
		data = '';
	}

	// Map RESTful PUT to Nodester API
	if (method == 'PUT') {
		formattedPath = '/app';
		data.appname = data.name;
		queryString = generateQueryParams(data);
	}

	console.log("query string ===> ", queryString);
	if (process.env["debug"]) {
		console.log("formatted path ===> ", formattedPath);
		console.log("method ===> ", method);
		console.log("params ===> ", data);
	}

	var options = {
		host: HOST,
		port: PORT,
		path: formattedPath,
		method: method,
		headers: {
			"Authorization": "Basic " + credentials
		}
	};

	// headers
	if (method != "GET") {
		options.headers["Content-Length"] = queryString.length.toString();
		options.headers["Content-Type"] = "application/x-www-form-urlencoded";
	}
	if(process.env["debug"]){
		console.log("---Options---");
		console.log('HOST ===> ' + options.host);
		console.log('PORT ===> ' + options.port);
		console.log('PATH ===> ' + options.path);
		console.log('METHOD ===> ' + options.method);
		console.log('---END Options---');
	}
	// request object
	var req = http.request(options);
	// write post body data
	if (method != "GET") req.write(queryString);

	req.on("response", function(res) {
		if(process.env["debug"]){
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
		}

		res.setEncoding('utf8');
		data = '';
		res.on('data', function(chunk) {
			if (typeof(callback) == "function") {
				data += chunk;
			}
		});

		res.on('end', function() { callback(data); })
	});

	req.on("error", function(err) {
		console.log('ERROR: ', err);
	});

	req.end();
}

// Expose Library Methods
exports.request = request;
exports.authorize = authorize;
