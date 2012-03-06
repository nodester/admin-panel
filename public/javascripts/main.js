(function() {

	// Global object
	window.panel = {};

	// Models & Collections
	// --------------------

	var App = Backbone.Model.extend({
		// actions: start, stop, show logs, show info, destroy
		
		// The Nodester API exposes individual apps at /app, while the list of apps
		// is at /apps
		url: function() { 
			console.log(this);
			return '/api/apps/' + this.get('name');
		}
	});

	var Apps = Backbone.Collection.extend({
		model: App,
		url: '/api/apps'
	});

	var Domain = Backbone.Model.extend({ 
		url: function() { return '/api/appdomains/'; }
	});

	var Domains = Backbone.Collection.extend({
		model: Domain,
		url: '/api/appdomains'
	});

	var apps = new Apps();


	// Router
	// ------

	// Meh, not sure how to handle this yet,
	// and its utility seems minimal. Later.
	var Router = Backbone.Router.extend({
		initialize: function() {
			panel.appListView = {};
			panel.domainListView = {};
			panel.appDetailView = {};
			panel.navView = new NavView(); 
		},

		routes: {
			'apps': 'apps',
			'domains': 'domains',
			'login': 'login',
			'apps/:appname' :'appDetail',
			'*path': 'default'
 
		},

		apps: function() {
			console.log('apps called')
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
			'click .app_info' : 'showInfo',
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
			$.get('/api/applogs/' + this.model.id, function(res) {
				//TODO Check if no info in logs and display message
				if(res.status && res.status === 'failure'){
					$('#modal').modal({
						content: 'No Logs Available for this App'
					});
				} else{
					var logTmpl = $('#log-tmpl').html();
					var html = Mustache.to_html(logTmpl, {lines: res.lines});
					$('#modal').html(html);
					$('#modal').modal('show');
			}
			});
		},
		showInfo: function(e) {
			e.preventDefault(); 
			var appname= this.model.id; 
		
			panel.router.navigate('apps/'+appname , {trigger: true });
			
			var details= new App({name:appname});
			details.fetch();
			details.on('change', function(){
				var infoTmpl = $('#app-info-tmpl').html();
				var html = Mustache.to_html(infoTmpl, this.toJSON());
				
				$('#modal').html(html);
				$('#modal').modal('show'); 
			}); 
		} 
	});

	var AppDetailView = Backbone.View.extend({
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
			this.destroy();
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
			var html = Mustache.to_html(this.tmpl);
			$('.content').html(html).fadeIn('fast');
			this.collection.each(function(app) {
				var view = new AppView({model: app});
				$('.tree tbody').append(view.render().el);
			});
			this.delegateEvents(this.events);
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
					alert('Domain Removed');
					panel.domainListView.collection.fetch()
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
			//var html = Mustache.to_html(this.tmpl, this.collection.toJSON());
			//this.$el.html(html);
		
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


	$(function() {
		panel.router = new Router();
		Backbone.history.start({pushState: true});
		panel.router.navigate();
		//HACK Until I wire it into the backbone view
		$(".swap > span").live("click", function(e){
			$(this).hide().next().show().focus();
		});
		$(".swap > input").live("change", function(e){
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
		$('#modal').on('hidden', function(){
		 	history.back();
		});
	});

})();