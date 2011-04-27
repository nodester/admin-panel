(function($) {
  // on ready
	$(document).ready(function() {
	  // cache some doms
	  var $loader = $("#loader"),
	      $tree = $(".tree");
	  // default load
		$("a[rel='ajax']").click(function(e) {
			e.preventDefault(); // prevent defailt
			// cache some more
			var $this = $(this),
			    href = $this.attr("href"); // get href
			//remove active class
			$(".lnav .active").removeClass("active"); 
			// add active class
			$this.addClass("active"); 
			// fadeout tree
			$tree.fadeOut('fast', function() {
			  // show loader
			  $loader.fadeIn('fast');
			});
			// ajax
			$.ajax({			  
				url:href,
				success:function(r) {
				  if(r.status)
				    return;
				  // init vars
					var keys = getKeys(r[0]),
					    len = keys.length,
					    template = "",
					    view = {items:r},
					    apps_template = "{{#items}}<tr>--sub--</tr>{{/items}}",
					    header_template = "";
					// run across keys from api
					for(var i=0;i<len;i++) {
					  // create table rows
					  template += ["<td>{{",keys[i],"}}</td>"].join("");
					  // create table header row
					  header_template += ["<th>",keys[i],"</th>"].join("");
				  }
					// replace sub with new  
					apps_template = apps_template.replace(/--sub--/i, template);
					// hide loader, but show table
					$loader.fadeOut('fast', function() {
					  $tree.html(["<thead><tr>",header_template,"</tr></thead>","<tbody>", Mustache.to_html(apps_template, view),"</tbody>"].join("")).fadeIn("fast");
					}); // hide loader
				}
			});
		});
		// trigger my_apps
		$("#my_apps").trigger("click");
		
	}); // end doc ready
	
	// get keys of object
	function getKeys(obj) {
	  var keys = [];
    for(var key in obj) {
      keys.push(key);
    }
    return keys;
	}
})(jQuery);