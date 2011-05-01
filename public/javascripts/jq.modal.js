(function($) {
  // Plugin
  $.fn.modal = function(options) {
    
      var defaults = {
      animation: 'fadeAndPop', //fade, fadeAndPop, none
      animationspeed: 600, //how fast animtions are
      closeonbackgroundclick: true, //if you click background will modal close?
      dismissmodalclass: 'close', //the class of a button or element that will close an open modal
      modalSize: 'small',
      content: "",
      onOpen: function() {},
      onClose: function() {}
    };

      //Extend dem' options
      var options = $.extend({}, defaults, options);

      return this.each(function() {
        // Global Vars
        var modal = $(this),
          topMeasure  = parseInt(modal.css('top')),
          topOffset = modal.height() + topMeasure,
          locked = false,
          modalBG = $('.modal-bg'),
          modalContent = $("#modal_content");

          // Create Modal BG
          if(modalBG.length == 0) {
            modalBG = $('<div class="modal-bg" />').insertAfter(modal);
          }
          /* Event Listeners */
          //Open Modal Immediately
          openModal();
          //Close Modal Listeners
          var closeButton = $('.' + options.dismissmodalclass).bind('click.modalEvent',closeModal)
          if(options.closeonbackgroundclick) {
            modalBG.css({"cursor":"pointer"})
            modalBG.bind('click.modalEvent',closeModal)
          }
          /* Animations */
          //Entrance Animations
          function openModal() {
            modalContent.html(options.content);
            modalBG.unbind('click.modalEvent');
            modal.attr("class","modal").addClass(options.modalSize);
            $('.' + options.dismissmodalclass).unbind('click.modalEvent');
            if(!locked) {
              lockModal();
              if(options.animation == "fadeAndPop") {
                modal.css({'top': $(document).scrollTop()-topOffset, 'opacity' : 0, 'visibility' : 'visible'});
                modalBG.fadeIn(options.animationspeed/2);
                modal.delay(options.animationspeed/2).animate({
                  "top": $(document).scrollTop()+topMeasure,
                  "opacity" : 1
                }, options.animationspeed,unlockModal());
              }
              if(options.animation == "fade") {
                modal.css({'opacity' : 0, 'visibility' : 'visible', 'top': $(document).scrollTop()+topMeasure});
                modalBG.fadeIn(options.animationspeed/2);
                modal.delay(options.animationspeed/2).animate({
                  "opacity" : 1
                }, options.animationspeed,unlockModal());
              }
              if(options.animation == "none") {
                modal.css({'visibility' : 'visible', 'top':$(document).scrollTop()+topMeasure});
                modalBG.css({"display":"block"});
                unlockModal()
              }
            }
            // Execute Callback
            options.onOpen.apply()
          }

          //Closing Animation
          function closeModal() {
            if(!locked) {
              lockModal();
              if(options.animation == "fadeAndPop") {
                modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
                modal.animate({
                  "top":  $(document).scrollTop()-topOffset,
                  "opacity" : 0
                }, options.animationspeed/2, function() {
                  modal.css({'top':topMeasure, 'opacity' : 1, 'visibility' : 'hidden'});
                  unlockModal();
                });
              }
              if(options.animation == "fade") {
                modalBG.delay(options.animationspeed).fadeOut(options.animationspeed);
                modal.animate({
                  "opacity" : 0
                }, options.animationspeed, function() {
                  modal.css({'opacity' : 1, 'visibility' : 'hidden', 'top' : topMeasure});
                  unlockModal();
                });
              }
              if(options.animation == "none") {
                modal.css({'visibility' : 'hidden', 'top' : topMeasure});
                modalBG.css({'display' : 'none'});
              }
            }
          }
          //Lock Animation
          function unlockModal() {
            locked = false;
          }
          function lockModal() {
            locked = true;
          }
      });//each call
  }
})(jQuery);
