function check_auth(options) {
  options= options || {};
  var auth= {};
	// Authentication Lib name
  auth.name     = options.name || "awesomeauth";
	
	// validate_creds
 	function validate_credentials( executionScope, request, response, callback ) {
		if( request.user.user == 'foo' && request.user.password == 'bar' ) {
			console.log('s');
      executionScope.success( {name:request.user.user}, callback )
    } else {
			console.log('f');
      executionScope.fail( callback )
    }
  };

	// expose this method
  auth.authenticate = function(req, res, callback) {
		if( req.user && req.user.user && req.user.password ) { 
		  validate_credentials( this, req, res, callback );
		} else {
		  res.end('dead');
		}
  }

  return auth;
}


exports.auth = check_auth;