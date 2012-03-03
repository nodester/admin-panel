$(function(){
	var Nodester = {},
	_isNotValildEmail = function (email) { 
		//regex taken from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
		//not perfect and am trusting that 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA	-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return !re.test(email);
	},
	_isNotValidUsername = function(name){
		//simple check for spaces until I learn what a valid username is
		return (name.indexOf(' ') > -1 || name.length === 0)
	};
	Nodester.User = Backbone.Model.extend({
		urlRoot: '/api/user',
		validate: function(attributes){
			var results = [];
			if(attributes.password.length < 6){
				results.push({message:'Password must be at least 6 characters long', attribute:'password'});
			}
			if(attributes.password !== attributes.confirmPassword){
				results.push({message: 'Passwords must match', attribute:'confirmPassword' });
			}
			if(_isNotValildEmail(attributes.email)){
				results.push({message: 'Email is not valid', attribute: 'email' });
			}
			if(_isNotValidUsername(attributes.username)){
				results.push({message: 'Username must be valid characters', attribute: 'username' });
			}
			
			if(results.length > 0){
				return results;
			}
		},
		defaults:{
			username: '',
			email: '',
			password: '',
			confirmPassword: '',
			coupon: '',
			apps : []
		},
		
	});
	
	Nodester.UserRegistrationView = Backbone.View.extend({
		el: '#register-user',
		initialize: function(){
			//?? this.render();
			
		},
		events: {
			"click button[type=submit]" : "saveUser"
		},
		saveUser: function(){
			this.model.set({
				
				username : $('#username').val(),
				email : $('#email').val(),
				password : $('#password').val(),
				confirmPassword : $('#confirmPassword').val(),
				coupon : $('#coupon').val(),
				rsaKey : $('#rsakey').val()
				
			});
			if(this.model.isValid()){
				this.model.save({
					error:function(model, response){
						console.log(arguments);
					},
					success: function(model, response){
						console.log(arguments);
					}
				}); 
			} else{
				console.log('it is wrong');
			}
			return false;
		}
		
	})
	
	
	var user = new Nodester.User();

	user.bind('error', function(model, errors){
		var errorMessages = '';
		for (var i=errors.length - 1; i >= 0; i--) {
			
			$('#'+ errors[i].attribute).parent().append('<span class="help-inline">' + errors[i].message + '</span>').parent().addClass('error');
			errorMessages = errorMessages +  errors[i].message + '<br />';
			
		};
		
		$('#userform-message p').html(errorMessages);
		$('#userform-message').addClass(' alert alert-error alert-block fade in').fadeIn();
	});
	
	user.on('sync', function(model, response){
		if(response.status==='failure'){
			$('#userform-message p').html(response.message);
			$('#userform-message').addClass(' alert alert-error alert-block fade in').fadeIn();
		}
	})

	var view = new Nodester.UserRegistrationView({model : user});
  
});