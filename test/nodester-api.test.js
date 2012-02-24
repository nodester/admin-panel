var assert = require('assert'),
	http = require('http'),
	request = require('request'),
	url = require('url'),
	mockRequest = require('mock-request'),
	nodester = require('../lib/nodester-api').request,
	authorize = require('../lib/nodester-api').authorize,
	fakeweb = require('node-fakeweb');
	console.log('begin testing');
 
	console.log(url.parse('http://api.nodester.com:80/test'));
	fakeweb.allowNetConnect = false;
	fakeweb.registerUri({uri: 'http://api.nodester.com:80/', body: 'Hello You faked thing'});
	request.get({uri: 'http://api.nodester.com:80/test'}, function(err, resp, body) { console.log(body); });

	
 