(function($) {
	$(document).ready(function() {
		$("a[rel='ajax']").click(function(e) {
			e.preventDefault();
			var href = $(this).attr("href");
			$.ajax({
				url:href,
				success:function(r) {
					var keys = getKeys(r[0]),
					    len = keys.length,
					    template = "",
					    view = {items:r},
					    apps_template = "{{#items}}<tr>--sub--</tr>{{/items}}",
					    header_template = "";
					// run across array
					for(var i=0;i<len;i++) {
					  template += ["<td>{{",keys[i],"}}</td>"].join("");
					  header_template += ["<th>",keys[i],"</th>"].join("");
				  }
					// replace sub with new  
					apps_template = apps_template.replace(/--sub--/i, template);
					$(".tree").html(["<thead><tr>",header_template,"</tr></thead>","<tbody>", Mustache.to_html(apps_template, view),"</tbody>"].join(""));
				}
			});
		});
	});
	
	// get keys of object
	function getKeys(obj) {
	  var keys = [];
    for(var key in obj) {
      keys.push(key);
    }
    return keys;
	}
})(jQuery);