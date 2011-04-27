(function($) {
	$(document).ready(function() {
	  var $loader = $("#loader"),
	      $tree = $(".tree");
	  $loader.fadeOut('fast');
		$("a[rel='ajax']").click(function(e) {
			e.preventDefault(); // prevent defailt
			var $this = $(this),
			    href = $this.attr("href"); // get href
			
			$(".lnav .active").removeClass("active"); //remove active class
			$this.addClass("active"); // add active class
			$tree.fadeOut('fast', function() {
			  $loader.fadeIn('fast'); // show loader
			});
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
					$loader.fadeOut('fast', function() {
					  $tree.html(["<thead><tr>",header_template,"</tr></thead>","<tbody>", Mustache.to_html(apps_template, view),"</tbody>"].join("")).fadeIn("fast");
					}); // hide loader
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