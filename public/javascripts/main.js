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
		this.tmpl = $('#app-body-tmpl').html();
		this.collection.fetch();
		this.collection.on('reset', this.render, this);
	},

	render: function(apps) {
		console.log('rendered!');
		var html = Mustache.to_html(this.tmpl, {items: apps.toJSON()});
		console.log(html);
		$('.tree').html(html).fadeIn('fast');

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
		new AppListView({collection: apps});
	}

});


$(function() {
	new MainView;
});

})();