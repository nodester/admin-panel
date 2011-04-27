var express = require('express'),
		cauth= require('connect-auth'),
		auth = require('./auth'),
		nodester = require('./nodester-api');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(cauth(auth.auth())); // connect-auth with my custom auth
	app.use(express.logger()); // enable logger
  app.use(express.bodyParser()); // parse body
  app.use(express.methodOverride()); // ??
	app.use(express.cookieParser()); // cookie parser
	app.use(express.session({key :"ns",secret: "keyboard cat" })); // session store (NOTE cookieParser should be b4 this)
  app.use(app.router); // use the router
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Checks whether user has logged in
// No data store used, just plain cookie based auth
function checkAuth(req,res,next) {
	// if key=>cred is present in session
	// then user is logged in
	// --- Need to write logged in session 
	// after verification frm nodester
	if(req.session.cred) {
		// get from session
		console.log('from session');
		req.user = req.session.cred;
	} else {
		console.log('to session');
		req.user = {
			user: "rowoot",
			password: "hackerro"
		};
		// store to session
		req.session.cred = req.user;
	}
	// authenticate method, where req,res is passed and callback is passed
	req.authenticate(['awesomeauth'], function(err, authenticated) {
		console.log(authenticated);
  });
	next();
}

// Logout
app.get('/d',checkAuth, function(req,res) {
	// check whether user is logged in ?
	// then log him out
	req.session.destroy(); // destroy cookie session created
	res.redirect("/"); // redirect to home after delete
})

// Routes
app.get('/', checkAuth, function(req, res){
	// give auth name
	res.render('index', {
    title: 'Nodester Admin Panel'
  });
});

// Need to write paths to all ndoester APIs
// including GET and POST - done
// Need to figure out REGEX - done
app.all(/(.*)\/*/, function(req, res, next){
	var params = "";
	// based on verb, get params
	if(req.method == "GET") {
		params = req.query;
	} else {
		params = req.body;
	}
	
	console.log("body ==> ",req.body);
	console.log("query ==> ",req.query);
	console.log("params ==> ",req.params);
	
	nodester.request("GET", req.params, params, {user:"rowoot1",pass:"hackerro"},function(data) {
		res.header('Content-Type', 'application/json');
		console.log(typeof(data),data);
		res.end(data);
	});
	
});

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(9651);
  console.log("Express server listening on port %d", app.address().port);
}
