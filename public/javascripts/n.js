(function($) {
	$(document).ready(function() {
		var apps_template = "{{#items}}<li>name : {{name}}</li>{{/items}}";
		
		$("a[rel='ajax']").click(function(e) {
			e.preventDefault();
			var href = $(this).attr("href");
			$.ajax({
				url:href,
				success:function(r) {
					var view = {items:r};
					$(".c").html("<ul>" + Mustache.to_html(apps_template, view) + "</ul>");
				}
			});
		});
		
	});
})(jQuery);