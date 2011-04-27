function check_auth(options) {
  options= options || {};
  var auth= {};
	// Authentication Lib name
  auth.name     = options.name || "awesomeauth";
	
	// validate_creds
 	function validate_credentials( executionScope, request, response, callback ) {
		if( request.user.user == 'rowoot' && request.user.pass == 'hackerro' ) {
			console.log('s');
      executionScope.success( {name:request.user.user}, callback )
    } else {
			console.log('f');
      executionScope.fail( callback )
    }
  };

	// expose this method
  auth.authenticate = function(req, res, callback) {
		console.log("m here");
		if( req.user && req.user.user && req.user.pass ) { 
		  validate_credentials( this, req, res, callback );
		} 
  }

  return auth;
}

exports.auth = check_auth;