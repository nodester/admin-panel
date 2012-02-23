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
	      $tree = $(".tree"),
	      template = {
	        apps: {
			      body:["<td class='name'>{{name}}</td>",
                  "<td class='port'>{{port}}</td>",
  		            "<td class='status'>{{running}}</td>",
  		            "<td class='actions'>{{actions}}</td>"].join(""),
  		      header: ["<th>name</th>",
  		               "<th>port</th>",
  		               "<th>app-status</th>",
  		               "<th>action</th>"].join("")
			    },
			    appdomains: {
			      body:["<td class='domain'>{{domain}}</td>",
                  "<td class='appname'>{{appname}}</td>",
                  "<td class='actions'>{{actions}}</td>"].join(""),
  		      header: ["<th>domain</th>",
  		               "<th>appname</th>",
  		               "<th>action</th>"].join("")
			    }
	      };
        
	  // Main Links
	  // Apps List
	  // AppDomain List
		$("a[rel='main']").click(function(e) {
			e.preventDefault(); // prevent defailt
			// init vars
			var $this = $(this),
			    href = $this.attr("href"), // get href from a
			    curr_page = {uri: href, path: Helper.getPath(href)};
			    
			//remove active class
			$(".lnav .active").removeClass("active"); 
			// push state of page
			history.pushState(curr_page, null, curr_page.uri);
			// add active class
			$this.parent().addClass("active"); 
			// fadeout tree
			$tree.fadeOut('fast', function() {
			  // show loader
			  $loader.fadeIn('fast');
			});
			
			ajaxHelpers.main({curr_page:curr_page,template:template[curr_page.path]}, function(template) {
  			// hide loader, but show table
  			$loader.fadeOut('fast', function() {
  			  $tree.html(template).fadeIn("fast");
  			}); // hide loader
			});
			
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
	      if(r.status == "success") {
  	      // since href can be /apps or /appdomains
  	      switch(href.split("/")[1]) {
  	        case 'app':
  	          var $tRow = $this.parent().parent();
  	          $tRow.find(".status").text(r.running); // change running
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
	      href = $this.attr("href"),
	      thisHtml = $this.html(),
	      thisCss = $this.attr("class"),
	      data = JSON.parse($this.attr("data-params"));
	  // remove put from rel --- temporary
    $this.removeAttr("rel").removeAttr("class");
    $this.html(Helper.inlineLoader($this)); //loader 
	  $.ajax({
	    url:"/api" + href ,
	    type:"DELETE",
	    data:data,
	    success:function(r) {
	      if(r.status && r.status == "success") {
	        //window.location = "/apps";
	      } else {
	        // error
	      }
	    },
	    error: function(jqXHR, textStatus, errorThrown){
			console.log('error');
			console.log(jqXHR);
			console.log(textStatus);
			console.log(errorThrown);
		},
      complete:function() {
	      $this.attr("rel", "put").attr("class",thisCss);
	      $this.html(thisHtml);
	    }
	  })
	  return false;
	});
	
	
	// Click event for links with method=POST
	// Methods
	// CREATE App
	// curl -X POST -u "testuser:123" -d "appname=a&start=hello.js" http://api.nodester.com/app
	// Delete AppDomain
	// curl -X DELETE -u "testuser:123" -d "appname=test&domain=example.com" http://api.nodester.com/appdomains
	$("a[rel='post']").live("click", function(e) {
	  e.preventDefault();
	  var $this = $(this),
	      thisHtml = $this.html(),
	      href = $(this).attr("href"),
	      data = JSON.parse($(this).attr("data-params"));
	      // remove put from rel --- temporary
    $this.attr("rel", "");
	  $.ajax({
	    url:"/api" + href,
	    type:"POST",
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
	      href = $this.attr("href"),
	      $modal = $("#modal"),
	      appname = $this.attr("data-params"),
	      modal_template = {
	        app_info : ["<h2>About <strong>" + appname + "</strong></h2>",
  	                  "<table cellpadding=0 cellspacing=0 class='table'>",
  	                  "<tr><td class='label'>port</td><td>{{port}}</td></tr>",
  	                  "<tr><td class='label'>gitrepo</td><td>{{gitrepo}}</td></tr>",
  	                  "<tr><td class='label'>start file</td><td>{{start}}</td></tr>",
  	                  "<tr><td class='label'>app status</td><td>{{running}}</td></tr>",
  	                  "<tr><td class='label'>process id</td><td>{{pid}}</td></tr>",
  	                  "</table>",
  	                  "<p><a href='/app/{{appname}}' data-params='" + JSON.stringify({appname: appname}) + "' class='submit r5 redgrad no_u' rel='delete'>Destroy</a></p>"].join(""),
  	      app_create : ["<h2>Create new app</h2>",
  	                    "<form method='post' action='/app' class='form'>",
                	      "<table cellpadding=0 cellspacing=0 class='table'>",
                        "<tr><td class='form_label'>app name</td>",
                        "<td><input class='input r5' name='params_appname' id='params_appname' /></td></tr>",
                        "<tr><td class='form_label'>start file<br /></td>",
                        "<td><input class='input r5' name='params_start' id='params_start' /></td></tr>",
  	                    "</table>",
  	                    "<input type='submit' class='submit r5 bluegrad' value='Create' />",
  	                    '<p id="failed" class="msg r5" style="display:none; margin-top:10px" ></p>',  	                    
  	                    "</form>"].join("")
	      },
	      modal_type = $this.attr("class");
	      
	  // to render forms    
	  if(modal_type == "app_create") {
	    $modal.modal({content: modal_template.app_create, onOpen: function() {
	      // bind the create app form
	      $modal.find(".form").submit(function(e) {
	        var $this = $(this),// form obj
	            href = $this.attr("action"),
	            $err = $this.find("#failed"); 
	        // hide error box
	        $err.hide();
	        $.ajax({
	          url: "/api" + href,
	          type:"post",
	          data: {appname:$("#params_appname").val(), start:$("#params_start").val()},
	          success: function(r) {
	            if(r.status && r.status == "success") {
	              $("a[href='/apps']").trigger("click"); // refresh app list
	              $modal.find(".close").trigger("click"); // close modal box
              } else {
                $this.find(".input").addClass("error"); // add error class to text
                $err.html(r.message).show(); // show error
              }
	          }          
	        })
	        e.preventDefault;
	        return false;
	      });
      }
	    }); 
	    return;
	  }
    // remove put from rel --- temporary
	  $this.attr("rel", "");
	  // show Loader on the spot
	  $this.html(Helper.inlineLoader($this));
	  $.ajax({
	    url:"/api" + href,
	    success:function(r) {
	      if(r.status == "success") {
	        $modal.modal({content: Mustache.to_html(modal_template[modal_type],r)}); 
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
	
	
	var ajaxHelpers = {
	  /**
	   * Ajax helpers for main
	   * <b>Expects</b>
	   * * curr_page (String) - {uri:"",path:""}
	   * * props (Array) - props for particular api end point
	   * <b>Returns<?b>
	   * callback (template)
	   *
	  **/
	  main: function(params,callback) {
	    var req_vars = params;
	    // to get the apps|domains list pages
			$.ajax({
				url:"/api" + req_vars.curr_page.uri,
				success:function(r) {
				  // if r.status (for errors)
				  // if r.length (if not array or == 0)
				  if(r.status || r.length == 0) {
				    callback("err");
				    return;  // get out
			    }
				  // init vars
					var keys = Helper.getKeys(r[0]),
					    len = keys.length;
				  // check curr_page
				  if(req_vars.curr_page) {
				    switch(req_vars.curr_page.path) {
				      case "apps":
				      // define params to be sent in the request
				      // append the params in the data-params
				      var start_action = JSON.stringify({
				        appname: "{{name}}",
				        running: true
				      }),
				      stop_action = JSON.stringify({
				        appname: "{{name}}",
				        running: false
				      });
				      // actions template
				      var actions_template = [
  				      "<a href='/app' data-params='" + start_action + "' rel='put'>start</a>",
  				      "<a href='/app' data-params='" + stop_action + "' rel='put'>stop</a>",
  				      "<a href='/app/{{name}}' data-params='{{name}}' class='app_info' rel='modal'>info</a>"
				      ].join(" ");
				      req_vars.template.body = req_vars.template.body.replace("{{actions}}",actions_template);
				      break;
				      // Actions for app domains
				      case "appdomains":
				      // define params to be sent in the request
				      // append the params in the data-params
				      var domain = JSON.stringify({
				        appname : "{{appname}}",
				        domain: "{{domain}}"
				      });
				      req_vars.template.body = req_vars.template.body.replace("{{actions}}","<a href='/appdomains' data-params='" + domain + "' rel='delete'>delete</a>");
				      break;
				    }
				  }
				  // callback with the template
				  callback(["<thead><tr>",
				          req_vars.template.header,
				          "</tr></thead>",
				          "<tbody>", 
				          Mustache.to_html("{{#items}}<tr>" + req_vars.template.body + "</tr>{{/items}}", {items:r}),
				          "</tbody>"].join(""));
				              
				} // end success of ajax
			}); // end ajax
	  }
	}
	
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
    inlineLoader: function($dom) {
      return "<span style='width:" + $dom.width()+ "px; display:inline-block'><img src='/static/i/loader-small.gif' /></span>"
    }
  }
})(jQuery);