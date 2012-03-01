(function() {

// Global object
window.panel = {};

// Models & Collections
// --------------------

var App = Backbone.Model.extend({
	// properties: name, port, status
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

var apps = new Apps;


// Router
// ------

// Meh, not sure how to handle this yet,
// and its utility seems minimal. Later.
var Router = Backbone.Router.extend({
	initialize: function() {
		panel.appListView = new AppListView({collection: apps});
		panel.domainListView = new DomainListView();
		panel.appListView.render();
	},

	routes: {
		'apps': 'apps',
		'domains': 'domains'
	},

	apps: function() {
		panel.appListView.render();
	},

	domains: function() {

	}

});


// Views
// -----
var AppView = Backbone.View.extend({
	tagName: 'tr',

	events: {
		'click .start': 'startApp',
		'click .stop': 'stopApp',
		'click .applogs': 'showLogs'
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
			var logTmpl = $('#log-tmpl').html();
			var html = Mustache.to_html(logTmpl, {lines: res.lines});
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
		// this.collection.on('reset', this.render, this);
	},

	render: function() {
		var html = Mustache.to_html(this.tmpl);
		$('.tree').html(html).fadeIn('fast');
		this.collection.each(function(app) {
			// console.log(app);
			var view = new AppView({model: app});
			$('.tree tbody').append(view.render().el);
		});
		console.log('rendered!');
		return this;
	}
});

var DomainListView = Backbone.View.extend({
});


$(function() {
	new Router;
	Backbone.history.start({pushState: true});
});

})();