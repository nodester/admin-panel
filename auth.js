var nodester = require('./nodester-api');

function check_auth(options) {
  options= options || {};
  var auth= {};
	// Authentication Lib name
  auth.name     = options.name || "awesomeauth";
	
	// validate_creds
 	function validate_credentials( executionScope, req, res, callback ) {
 	  // method, api path, data, credentials, callback
 	  console.log("nodester ==> ", nodester);
 	  // authorize: user
 	  nodester.authorize(req.user, function(bool) {
 	    if(bool) {
 	      executionScope.success( {name: req.user.user}, callback )
 	    } else {
 	      executionScope.fail( callback )
 	    }
 	  });
  };

	// expose this method
  auth.authenticate = function(req, res, callback) {
		console.log("m here");
		if( req.user ) { 
		  validate_credentials( this, req, res, callback );
		} 
  }

  return auth;
}

exports.auth = check_auth;