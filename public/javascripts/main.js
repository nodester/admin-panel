(function() {

// Models & Collections
// --------------------

var App = Backbone.Model.extend({
	// properties: name, port, status
	// actions: start, stop, show logs, show info, destroy
});

var Apps = Backbone.Collection.extend({
	model: App,
	url: '/api/apps'
});

var apps = new Apps;


// Views
// -----
var AppView = Backbone.View.extend({
});

var AppListView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},

	render: function() {
		apps.fetch();
	}
});

var DomainListView = Backbone.View.extend({
});

// This structure seems redundant now... but it will make sense once MainView
// is fleshed out
var MainView = Backbone.View.extend({
	initialize: function() {
		this.render();
	},

	render: function() {
		new AppListView;
	}

});


$(function() {
	new MainView;
});

})();