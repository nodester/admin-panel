(function() {

// Global object
window.panel = {};

// Models & Collections
// --------------------

var App = Backbone.Model.extend({
	// properties: name, port, status
	defaults : {
		"name" : "name",
		"port" : 12345,
		"running" : "true",
		"gitrepo" : "",
		"pid": 12345
	},
	// actions: start, stop, show logs, show info, destroy
	idAttribute: 'name',
	// The Nodester API exposes individual apps at /app, while the list of apps
	// is at /apps
	url: function() { return '/api/app/' + this.id; }
});

var Apps = Backbone.Collection.extend({
	model: App,
	url: '/api/apps'
});

var Domain = Backbone.Model.extend({
	idAttribute: 'domain',
	url: function(){return '/api/appdomains/' + this.appname}
});

var Domains = Backbone.Collection.extend({
	model: Domain,
	url: '/api/appdomains'
})

var apps = new Apps;


// Router
// ------

// Meh, not sure how to handle this yet,
// and its utility seems minimal. Later.
var Router = Backbone.Router.extend({
	routes: {
		'apps': 'apps',
		'domains': 'domains',
		'login': 'login'
	},

	apps: function() {
		panel.appListView = new AppListView({collection: apps});
		panel.appListView.render();
	},

	domains: function() {
		var domains = new Domains();
		panel.domainListView = new DomainListView({collection: domains});
		panel.domainListView.render();
	},

	login: function(){
		
	}

});


// Views
// -----
var AppView = Backbone.View.extend({
	tagName: 'tr',

	events: {
		'click .start': 'startApp',
		'click .stop': 'stopApp',
		'click .applogs': 'showLogs',
		'click .app_info' : 'showInfo'
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
			var logTmpl = $('#log-tmpl').html();
			var html = Mustache.to_html(logTmpl, {lines: res.lines});
			$('#modal').modal({
				content: html
			});
		});
	},
	showInfo: function(e) {
		e.preventDefault(); 
		var appname= this.model.id;
		$.get('/api/apps/' + this.model.id, function(res) {
			res.appname = appname
			var infoTmpl = $('#app-info-tmpl').html();
			var html = Mustache.to_html(infoTmpl, res);
			$('#modal').modal({
				content: html
			});
		});
	}
});

var AppListView = Backbone.View.extend({
	initialize: function() {
		this.tmpl = $('#app-list-tmpl').html();
		this.collection.fetch();
		this.collection.on('reset', this.render, this);
	},

	render: function() {
		var html = Mustache.to_html(this.tmpl);
		$('.tree').html(html).fadeIn('fast');
		this.collection.each(function(app) {
			var view = new AppView({model: app});
			$('.tree tbody').append(view.render().el);
		});
		return this;
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
		this.destroy();
	}
});
var DomainListView = Backbone.View.extend({
	initialize: function() {
		this.tmpl = $('#domain-list-tmpl').html();
		this.collection.fetch();
		this.collection.on('reset', this.render, this);
	},

	render: function() {
		//var html = Mustache.to_html(this.tmpl, this.collection.toJSON());
		//this.$el.html(html);
		
		var html = Mustache.to_html(this.tmpl);
		$('.tree').html(html).fadeIn('fast');
		this.collection.each(function(domain) {
			var view = new DomainView({model: domain});
			$('.tree tbody').append(view.render().el);
		});
		
		return this;
	}
});


$(function() {
	new Router;
	Backbone.history.start({pushState: true});
	
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
				//TODO Sync the collection
			}
		})
		$(this).hide().prev().html(val).show();

	});
});

})();