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
	tagName: 'tr',
	initialize: function() {
		this.tmpl = $('#app-tmpl').html();
	},
	render: function() {
		var html = Mustache.to_html(this.tmpl, this.model.toJSON());
		this.$el.html(html);
		return this;
	}
});

var AppListView = Backbone.View.extend({
	initialize: function() {
		this.tmpl = $('#app-list-tmpl').html();
		this.collection.fetch();
		this.collection.on('reset', this.render, this);
	},

	render: function(apps) {
		var html = Mustache.to_html(this.tmpl);
		$('.tree').html(html).fadeIn('fast');
		apps.each(function(app) {
			console.log(app);
			var view = new AppView({model: app});
			$('.tree tbody').append(view.render().el);
		});
		console.log('rendered!');
		return this;
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