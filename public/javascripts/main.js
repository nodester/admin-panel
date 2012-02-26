(function() {

// Models & Collections
// --------------------

var App = Backbone.Model.extend({
	// properties: name, port, status
	// actions: start, stop, show logs, show info, destroy
});

var Apps = Backbone.Collection.extend({
	model: App
});


// Views
// -----
var AppView = Backbone.Views.extend({
});

var AppListView = Backbone.Views.extend({
});

var DomainListView = Backbone.Views.extend({
});

var MainView = Backbone.Views.extend({
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