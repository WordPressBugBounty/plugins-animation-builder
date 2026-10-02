jQuery(window).ready(function() {

  gsap.registerPlugin(ScrollTrigger);

  var core_elements = [
    '.move-in-left', '.move-in-right','.move-in-up','.move-in-down',
    '.fade-in','.fade-in-up','.fade-in-left','.fade-in-right','.fade-in-down',
    '.flip-left','.flip-right','.flip-up','.flip-down',
    '.bounce-in-left','.bounce-in-right','.bounce-in-down','.bounce-in-up',
    '.zoom-in','.skew-in-left','.skew-in-right','.blur-in','.colour-gain',
    '.grow-up','.grow-left','.grow-right','.grow-down',
    '.shake','.swing-side','.swing-forward', '.rubber-band',
  ];

  var activated_elements = [];
  if(anibu_options.activated_elements){
    anibu_options.activated_elements.split().forEach(function(selector){
      activated_elements.push(selector);
    })
  }
  core_elements = core_elements.concat(activated_elements);

  // Loop over each selector
  core_elements.forEach(function(selector){
    jQuery(selector).each(function(){
      var el = jQuery(this);

      if(anibu_options.offset_pixels){
        var start = "top bottom-="+anibu_options.offset_pixels;
      }else{
        var start = "top bottom";
      }

      if(anibu_options.repeat_core_animations == true){
        gsap.timeline({
          scrollTrigger: {
            trigger: this,
            start: start,
            onEnter: () => el.addClass("scroll-triggered"),
            onEnterBack: () => el.addClass("scroll-triggered"),
            onLeave: () => el.removeClass("scroll-triggered"),
            onLeaveBack: () => el.removeClass("scroll-triggered"),
          }
        });
      }else{
        gsap.from(el, {
          scrollTrigger: {
            trigger: this,
            start: start,
            onEnter: () => el.addClass("scroll-triggered"),
          }
        });
      }
      
    });
  });


  //Speed and delay
  function ABgetClass(element, startsWith) {
		var result = undefined;
		jQuery(element.attr('class').split(' ')).each(function() {
			if (this.indexOf(startsWith) > -1) result = this;
		});
		return result;
	}

	jQuery('*[class*="delay-"]').each(function(){
			var className = ABgetClass( jQuery(this), 'delay-' );
			var delay = className.split('delay-')[1];
			
			jQuery(this).css({'transition-delay': delay+'ms'});
			jQuery(this).css({'animation-delay': delay+'ms'});
	
	});
	
	jQuery('*[class*="speed-"]').each(function(){
			var className = ABgetClass( jQuery(this), 'speed-' );
			var speed = className.split('speed-')[1];
			
			jQuery(this).css({'transition-duration': speed+'ms'});
			jQuery(this).css({'animation-duration': speed+'ms'});
	
	});

});