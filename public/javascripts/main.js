(function() {
	// Set underscore templates to mustache style
	_.templateSettings = {
	  interpolate : /\{\{(.+?)\}\}/g
	};

	var setObject = function(key, value) {
			localStorage.setItem(key, JSON.stringify(value));
		},
		getObject = function(key) {
		    return JSON.parse(localStorage.getItem(key));
		},
		getAppNames = function(){
			var names= [];
			var apps = getObject('apps');
			for (var i=0; i < apps.length; i++) {
				names.push(apps[i].name);
			};
			return names;
		},
		hasDomain = function(appname){
			var apps = getAppNames();
			var results = _.filter(apps, function(app){ return app === appname; });
			console.log(results);
			return results.length > 0;
			
		},
		flashMessage = function(message, type){
			$('.message-container')
				.addClass('alert alert-success alert-block')
				.html('<a class="close" data-dismiss="alert">x</a>' + message)
				.show();
			setTimeout(function(){
				$('.message-container').hide(400);
			}, 2000);
 
		};

	// Global object
	window.panel = {};

	// Models & Collections
	// --------------------

	var App = Backbone.Model.extend({
		idAttribute: 'name',

		initialize: function() {
			var appStatus = this._parseRunning(this.get('running'));
			this.set({up: appStatus[0], status: appStatus[1]});
		},
		
		_parseRunning: function(running) {
			if(running === undefined){
				running = 'Application failed to start';
			}
			switch(running) {
				case 'true':
				case true:
					return [true, 'running'];
					break;
				case 'false':
				case false : 
					return [false, 'stopped'];
					break;
				default:
					var text = running.toString().split('-').join(' ').split('_').join(' ');
					return [false, text];
					break;
			}
		}
	});

	var Apps = Backbone.Collection.extend({
		model: App,
		url: '/api/apps',

		getByName: function(name) {
			return this.find(function(app) {
				return app.get('name') === name;
			});

		}
	});

	var Domain = Backbone.Model.extend({ 
		url: function() { return '/api/appdomains/'; }
	});

	var Domains = Backbone.Collection.extend({
		model: Domain,
		url: '/api/appdomains'
	});
	 
	var EnvVar = Backbone.Model.extend({
		url: '/api/env',
		sync  : function(method, model, options){
			if(method==='update'){
				model.url = 'api/env/' + model.get('appname')+'/' + model.get('key');
			}else if(method ==='create'){
				model.url ='/api/env/' ; 
				options.method = 'PUT';
				method = 'update';

			}else if(method==='DELETE'){
				model.url ='/api/env/' + model.get('appname') +'/' + model.get('key'); 
			}
			console.log(options);
			return Backbone.sync(method, model, options);
		}
	});
	var apps = new Apps();


	// Router
	// ------

	// Meh, not sure how to handle this yet,
	// and its utility seems minimal. Later.
	var Router = Backbone.Router.extend({
		initialize: function() {
			panel.navView = new NavView(); 
		},

		routes: {
			'apps': 'apps',
			'domains': 'domains',
			'login': 'login',
			'apps/:appname' :'appDetail',
			'apps/:appname/envvars'  : 'envVars',
			'*path': 'default'
 
		},

		apps: function() {
			panel.appListView = new AppListView({collection: apps});
			panel.appListView.render();
		},
		appDetail:function(appname){
			panel.appDetailView = new AppDetailView({model: new App({name:appname})});
		},
		domains: function() { 
			var domains = new Domains(); 
			panel.domainListView = new DomainListView({collection: domains});
			panel.domainListView.render();
		},
		envVars: function(){
			
		},
		login: function() {
		
		},

		default: function() {
			this.navigate('apps');
		}

	});


	// Views
	// -----

	var NavView = Backbone.View.extend({
		el: '.nav',
		events: {
			'click li a': 'navigate'
		},

		navigate: function(e) {
			e.preventDefault();
			var href = $(e.currentTarget).attr('href');
			panel.router.navigate(href.substr(1), {trigger: true});
			// Switch active tab display
			this.$('li').removeClass('active');
			$(e.currentTarget).parent().addClass('active');
		}

	});

	var AppView = Backbone.View.extend({
		tagName: 'tr',

		events: {
			'click .start': 'startApp',
			'click .stop': 'stopApp',
			'click .applogs': 'showLogs',
			'click .app-info' : 'showInfo',
			'click .env-vars' : 'showEnvVars',
			'click .git-reset' : 'gitReset'
		},

		initialize: function() {
			this.tmpl = $('#app-tmpl').html();
			this.model.on('sync', this.render, this);
		},

		render: function() {
			var html = Mustache.to_html(this.tmpl, this.model.toJSON());
			this.$el.html(html);
			return this;
		},

		startApp: function(e) {
			e.preventDefault();
			this.model.set('running', true);
			this.model.save();
		},

		stopApp: function(e) {
			e.preventDefault();
			this.model.set('running', false);
			this.model.save();
		},

		showLogs: function(e) {
			e.preventDefault();
			
			var appname = this.model.get('name');
			$.get('/api/applogs/' + this.model.get('name'), function(res) {
				var lines;
				if(res.status && res.status === 'failure'){
					res.lines = ['No logs found'];
				}
					var logTmpl = $('#log-tmpl').html();
					var html = Mustache.to_html(logTmpl, {name: appname, lines: res.lines});
					$('#modal').html(html);
					$('#modal').modal('show');
				
			});
		},

		showInfo: function(e) {
			e.preventDefault(); 
			var appName = this.model.get('name'); 
		
			panel.router.navigate('apps/' + appName, {trigger: true});
			
			var app = apps.getByName(appName);
			var infoTmpl = $('#app-info-tmpl').html();
			var html = Mustache.to_html(infoTmpl, app.toJSON());
			
			$('#modal').html(html);
			$('#modal').modal('show'); 
		},

		showEnvVars: function(e){
			e.preventDefault();
			var appname= this.model.get('name');
			panel.router.navigate('apps/'+appname +'/envvars' , {trigger: true });
			//skip the mvc for now, ajax get the env vars and the build
			$.ajax({
				url:$(e.currentTarget).attr('href'),
				success: function(r){
					var vars = [];
					for (var key in r.message){
						vars.push({key: key, value: r.message[key]});
					};
					console.log({vars: vars})
					var envTmpl = $('#envvar-list-tmpl').html();
						var html = Mustache.to_html(envTmpl, {name: appname , vars: vars});
						$('#modal').html(html);
						$('#modal').modal('show');
				}
			})
		},
		gitReset: function(e){
			console.log('git reset');
			e.preventDefault();
			$.ajax({
				url: $(e.currentTarget).attr('href'),
				type: "DELETE",
				success: function(r) {
					flashMessage('The git repository and npm list has been reset');  
				}
			});
		} 
	});

	var AppDetailView = Backbone.View.extend({
		el: '#modal',
		initialize: function() {
			this.tmpl = $('#app-info-tmpl').html();
			this.model.on('sync', this.render, this);
		},

		render: function() {
			var html = Mustache.to_html(this.tmpl, this.model.toJSON());
			this.$el.html(html);
			return this;
		},
		events: {
			"click .delete" : "deleteApp"
		},
		deleteApp : function(e){
			e.preventDefault();
			if(!hasDomain($(e.currentTarget).data('params').appname)){
				$.ajax({
					url: $(e.currentTarget).attr('href'),
					type: "DELETE",
					success: function(r) {
						flashMessage('App Removed');
						panel.appListView.collection.fetch();
						$('#modal').modal('hide');
					}
				});
			}
		}
	});
	
	var AppListView = Backbone.View.extend({
		el: 'body',
		initialize: function() {
			
			this.tmpl = $('#app-list-tmpl').html();
			this.collection.fetch();
			this.collection.on('reset', this.render, this);
		},

		render: function() {
			//this feels very wrong 
			if(window.location.pathname === '/apps' || window.location.pathname ==='/'){
				setObject('apps', this.collection.toJSON());
				var html = Mustache.to_html(this.tmpl);
				$('.content').html(html).fadeIn('fast');
				this.collection.each(function(app) {
					var view = new AppView({model: app});
					$('.tree tbody').append(view.render().el);
				});
			}
			return this;
		},
		events: {
			"click #new-app" : "newApp",
			"click #create-app" : "createApp"
		}, 
		newApp: function(e){
			e.preventDefault(); 
			var html = Mustache.to_html($('#app-new-tmpl').html());
			$('#modal').html(html);
			$('#modal').modal('show');
			
		},
		createApp: function(e){
			panel.router.navigate('apps/new' , {trigger: true });
			e.preventDefault();
			var appname = $('#newapp-name').val(),
				start = $('#newapp-start').val();
			var newApp = new App(); 
			newApp.save({name:appname, start:start},{ success: function(){
				$('#modal').modal('hide');
			}});
		}
	});

	var DomainView = Backbone.View.extend({
		tagName: 'tr',
		initialize: function() {
			this.tmpl = $('#domain-tmpl').html();
			this.model.on('sync', this.render, this);
		},

		render: function() {
			var html = Mustache.to_html(this.tmpl, this.model.toJSON());
			this.$el.html(html);
			return this;
		},
		events: {
			"click .delete" : "deleteDomain"
		},
		deleteDomain : function(e){
			e.preventDefault();
			// destroy does not work, different urlthis.destroy();
			
			$.ajax({
				url: $(e.currentTarget).attr('href'),
				type: "DELETE",
				success: function(r) {
					flashMessage('Domain Removed');
					panel.domainListView.collection.fetch();
					$('#modal').modal('hide');
				}
			})
		}
	});
	var DomainListView = Backbone.View.extend({
		el:'body',
		initialize: function() {
			this.tmpl = $('#domain-list-tmpl').html();
			this.collection.fetch();
			this.collection.on('reset', this.render, this);
		},

		render: function() {
			if(window.location.pathname !== '/domains'){
				return this;
			}
			setObject('domains', this.collection.toJSON());
			var html = Mustache.to_html(this.tmpl);
			$('.content').html(html).fadeIn('fast');
			
			this.collection.each(function(domain) {
				var view = new DomainView({model: domain});
				$('.tree tbody').append(view.render().el);
			});
		
			return this;
		},
		events: {
			'click #new-domain' : 'openNewDomainModal',
			'click #create-domain' : 'addDomain'
		},
		openNewDomainModal: function(e){
			e.preventDefault();
			var html = Mustache.to_html($('#domain-new-tmpl').html());
			$('#modal').html(html);
			$('#modal').modal('show');
			
			
			$('#newdomain-appname').typeahead({source:getAppNames()})
			panel.router.navigate('appdomains/new' , {trigger: true });
		},
		addDomain: function(e){
			e.preventDefault();
			var appname = $('#newdomain-appname').val(),
				domain = $('#newdomain-domain').val();
			var newDomain = new Domain(); 
			newDomain.save({appname:appname, domain:domain},{ success: function(){
				$('#modal').modal('hide');
			}});
		}
	});
	
	var EnvVarListView = Backbone.View.extend({
		
		
	});

	$(function() { 
		if(window.location.pathname==='/login'){
			return;
		}
		panel.router = new Router();
		Backbone.history.start({pushState: true});
		
		panel.router.navigate('/apps');
		//HACK Until I wire it into the backbone view
		$(".swap > span").live("click", function(e){
			$(this).hide().next().show().focus();
		});
		$(".swap.startfile > input").live("change", function(e){
			var $input = $(this),
				val = $input.val(),
				data = $input.data('params');
				appname= data.appname,
				data.start = val; 
			$.ajax({
				url: "/api/apps/" + appname,
				type: "PUT",
				data: {"start": data.start, "appname": appname, "name": appname},
				success: function(r) {
					alert('You will need to restart server for change');
					panel.appListView.collection.fetch()
				}
			})
			$(this).hide().prev().html(val).show();

		});
		$(".swap.envvar > input").live("change", function(e){
			var $input = $(this),
				val = $input.val(),
				data = $input.data('params');
				appname= data.appname,
				data.start = val; 
				
				var env = new EnvVar();
				env.set({appname:appname, key : data.key, value:val});
				env.save();
				$(this).hide().prev().html(val).show();
				$('#modal').modal('hide');
				flashMessage('You will need to restart server for change.');

		});
		$('#modal').on('hidden', function(){
		 	history.back();
		});
		$('#loader').ajaxStart(function(){ 
		   $(this).show();
		 }).ajaxStop(function(){
			$(this).hide();
		})
		;
	});

})();