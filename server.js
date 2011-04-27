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
	req.lstate = false;
	// if key=>cred is present in session
	// then user is logged in
	// --- Need to write logged in session 
	// after verification frm nodester
	if(req.session.cred) {
		// get from session
		console.log('logged in');
		req.user = req.session.cred;
		req.lstate = true;
	} else {
		console.log('not logged in');
	}
	next();
}

// Logout
app.get('/logout',checkAuth, function(req,res) {
	// check whether user is logged in ?
	// then log him out
	req.session.destroy(	); // destroy cookie session created
	res.redirect("/"); // redirect to home after delete
});

// Login
app.get('/login',checkAuth, function(req,res) {
	// check whether user is logged in ?
	// then log him out
	if(req.lstate == true)
		res.redirect("/");
	else
		res.render('login', {
	    title: 'Login | Nodester Admin Panel'
	  });
});

app.post('/login',checkAuth, function(req,res) {
	// check whether user is logged in ?
	// then log him out
	if(req.lstate == true) {
		res.redirect('/');
	} else {
		req.user = {
			user: "rowoot",
			pass: "hackerro"
		};
		console.log("body ==> ",req.body);
		// authenticate user
		req.authenticate(['awesomeauth'], function(err, authenticated) {
			console.log("auth it");
			if(authenticated) {
				// set session
				console.log('success');
				req.session.cred = req.user; //set session
				res.redirect("/");
			} else {
				// don`t set session
				console.log("failed");
				res.redirect("/login");
			}
	  });	
	}
});


// Routes
app.get('/', checkAuth, function(req, res){
	// give auth name
	if(req.lstate == false)
		res.redirect("/login");
	else
		res.render('index', {
    	title: 'Index | Nodester Admin Panel'
  	});
});

// Need to write paths to all ndoester APIs
// including GET and POST - done
// Need to figure out REGEX - done
app.all("/api/*", checkAuth, function(req, res, next){
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
	
	nodester.request("GET", req.params[0], params, req.user,function(data) {
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
