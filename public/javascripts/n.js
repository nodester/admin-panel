Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

(function($) {
  var curr_page = null,
      curr_path = window.location.pathname,
      exclude_keys = ["gitrepo"];
  
  window.onpopstate = function(e) { 
    if(e.state == undefined)
      return false;
    $("a[href='"+ e.state.uri +"']").trigger('click');
  };
  
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
			    href = $this.attr("href"),
			    curr_page = {uri: href, path: Helper.getPath(href)};
			    
			//remove active class
			$(".lnav .active").removeClass("active"); 
			// push state of page
			history.pushState(curr_page, null, curr_page.uri);
			
			// add active class
			$this.addClass("active"); 
			// fadeout tree
			$tree.fadeOut('fast', function() {
			  // show loader
			  $loader.fadeIn('fast');
			});
			// ajax
			$.ajax({			  
				url:"/api" + href,
				success:function(r) {
				  if(r.status || r.length == 0)
				    return;
				  // init vars
					var keys = Helper.getKeys(r[0]),
					    len = keys.length,
					    template = "",
					    view = {items:r},
					    apps_template = "{{#items}}<tr>--sub--</tr>{{/items}}", //template for apps
					    header_template = ""; // template for table header
					    
					// run across keys from api
					for(var i=0;i<len;i++) {
					  // exclude a few keys
					  if(exclude_keys.indexOf(keys[i]) != -1)
					    continue;
					  // create table rows
					  template += ["<td>{{",keys[i],"}}</td>"].join("");
					  // create table header row
					  header_template += ["<th>",keys[i],"</th>"].join("");
				  }
				  // add actions key to header
				  header_template += "<th>actions</th>";
				  template += "<td>--actions--</td>";
				  // decide what are the actions
				  // based on type
				  
				  if(curr_page) {
				    switch(curr_page.path) {
				      case "apps":
				      var start_action = JSON.stringify({
				        appname: "{{name}}",
				        running: true
				      }),
				      stop_action = JSON.stringify({
				        appname: "{{name}}",
				        running: false
				      });
				      var actions = [
  				      "<a href='/app' data-params='" + start_action + "' rel='put'>start</a>",
  				      "<a href='/app' data-params='" + stop_action + "' rel='put'>stop</a>",
  				      "<a href='/app/{{name}}' rel='modal'>info</a>"
				      ].join(" ");
				      template = template.replace("--actions--",actions);
				      
				      break;
				      // Actions for app domains
				      case "appdomains":
				      var domain = JSON.stringify({
				        appname : "{{appname}}",
				        domain: "{{domain}}"
				      });
				      template = template.replace("--actions--","<a href='/appdomains' data-params='" + domain + "' rel='delete'>delete</a>");
				      break;
				    }
				  }
					// replace sub with new  
					apps_template = apps_template.replace(/--sub--/i, template);
					// hide loader, but show table
					$loader.fadeOut('fast', function() {
					  $tree.html(["<thead><tr>",header_template,"</tr></thead>","<tbody>", Mustache.to_html(apps_template, view),"</tbody>"].join("")).fadeIn("fast");
					}); // hide loader
				} // end success of ajax
			}); // end ajax
			return false;
		}); // end onclick
		
		// default view to be loaded
		if( curr_path == "/")
		  $("#my_apps").trigger('click');
		else
		  $("a[href='"+curr_path+"']").trigger('click');
		  
	}); // end doc ready
	
	
	$("a[rel='put']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      href = $(this).attr("href"),
	      data = JSON.parse($(this).attr("data-params"));
	      
	  $.ajax({
	    url:"/api" + href,
	    type:"PUT",
	    data:data,
	    success:function(r) {
	      
	    }
	  })
	  return false;
	});
	
	$("a[rel='delete']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      href = $(this).attr("href"),
	      data = JSON.parse($(this).attr("data-params"));
	      
	  $.ajax({
	    url:"/api" + href,
	    type:"DELETE",
	    data:data,
	    success:function(r) {
	      
	    }
	  })
	  return false;
	});
	
	var Helper = {
    // Gets URI Path
    getPath: function(uri) {
      var temp = uri.split("/").clean("");
      return temp[temp.length-1];
    },
    // get keys of object
    getKeys: function(obj) {
  	  var keys = [];
      for(var key in obj) {
        keys.push(key);
      }
      return keys;      
    }
  }
})(jQuery);