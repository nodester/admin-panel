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
        
	  // Click event for main links
	  // Apps List
	  // AppDomain List
		$("a[rel='ajax']").click(function(e) {
			e.preventDefault(); // prevent defailt
			// init vars
			var $this = $(this),
			    href = $this.attr("href"), // get href from a
			    curr_page = {uri: href, path: Helper.getPath(href)}; // info about clicked page
			    
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
			
			// to get the apps|domains list pages
			$.ajax({			  
				url:"/api" + href,
				success:function(r) {
				  // if r.status (for errors)
				  // if r.length (if not array or == 0)
				  if(r.status || r.length == 0)
				    return;  // get out
				    
				  // init vars
					var keys = Helper.getKeys(r[0]),
					    len = keys.length,
					    template = "",
					    view = {items:r},
					    apps_template = "{{#items}}<tr>--sub--</tr>{{/items}}", //template for apps
					    header_template = ""; // template for table header
					    
					// run across property keys from result
					for(var i=0;i<len;i++) {
					  // exclude a few keys
					  if(exclude_keys.indexOf(keys[i]) != -1)
					    continue;
					  // create table rows
					  template += ["<td class='", keys[i] ,"'>{{", keys[i] ,"}}</td>"].join("");
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
	
	// Click event for links with method=PUT
	// Methods
	// Update User
	// curl -X PUT -u "testuser:123" -d "password=test" http://api.nodester.com/user
  // curl -X PUT -u "testuser:123" -d "rsakey=1234567" http://api.nodester.com/user	
  // Change application details (start|stop|restart) and app_details
  // curl -X PUT -u "testuser:123" -d "appname=a&running=true" http://api.nodester.com/app
  // curl -X PUT -u "testuser:123" -d "appname=a&start=hello1.js" http://api.nodester.com/app
	$("a[rel='put']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      href = $this.attr("href"),
	      thisHtml = $this.html(),
	      $allRels = $("a[rel='put']"),
	      data = JSON.parse($this.attr("data-params"));
	  // remove put from rel --- temporary
	  $allRels.attr("rel", "");
	  $this.html(Helper.inlineLoader($this));
	  // send ajax request
	  $.ajax({
	    url:"/api" + href,
	    type:"PUT",
	    data:data,
	    success:function(r) {
	      console.log(r);
	      if(r.status == "success") {
  	      // since href can be /apps or /appdomains
  	      switch(href.split("/")[1]) {
  	        case 'app':
  	          var $tRow = $this.parent().parent();
  	          $tRow.find(".pid").text(r.pid); // change pid
  	          $tRow.find(".running").text(r.running); // change running
  	        break;
  	        case 'appdomains':
	        
  	        break;
  	      }
        } else {
          // error
        }
	    },
	    // on ajax complete, instill put agin
	    complete:function() {
	      $allRels.attr("rel", "put");
	      $this.html(thisHtml);
	    }
	  })
	  return false;
	});
	
	
	// Click event for links with method=DELETE
	// Methods
	// Delete App
	// curl -X DELETE -u "testuser:123" -d "appname=test" http://api.nodester.com/app
	// Delete AppDomain
	// curl -X DELETE -u "testuser:123" -d "appname=test&domain=example.com" http://api.nodester.com/appdomains
	$("a[rel='delete']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      href = $(this).attr("href"),
	      data = JSON.parse($(this).attr("data-params"));
	      // remove put from rel --- temporary
    $this.attr("rel", "");    
	  $.ajax({
	    url:"/api" + href,
	    type:"DELETE",
	    data:data,
	    success:function(r) {
	      
	    }
	  })
	  return false;
	});
	
	// Click Event to display Modal Box
	// Methods
	// SHow Information about APP
	$("a[rel='modal']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      thisHtml = $this.html(),
	      href = $(this).attr("href");
    // remove put from rel --- temporary
	  $this.attr("rel", "");
	  // show Loader on the spot
	  $this.html(Helper.inlineLoader($this));
	  $.ajax({
	    url:"/api" + href,
	    success:function(r) {
	      if(r.status == "success") {
	        $("#modal").modal({contnet:r});
	      } else {
	        // error
	      }
	    },
	    // on ajax complete, instill put agin
	    complete:function() {
	      $this.attr("rel", "modal");
	      $this.html(thisHtml);
	    }
	  })
	  return false;
	});
	
	// Helper Methods
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
    },
    // return inline loader
    inlineLoader: function($tag) {
      return "<span style='width:" + $tag.width()+ "px; display:inline-block'><img src='/static/i/loader-small.gif' /></span>"
    }
  }
})(jQuery);