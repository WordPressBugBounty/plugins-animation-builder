jQuery(window).ready(function(){
	jQuery('.header-nav li').on('click', function(){
		var page = jQuery(this).attr('data-name');
		jQuery('.page, .header-nav li').removeClass('active');
		jQuery('.page[data-name="'+page+'"], .header-nav li[data-name="'+page+'"]').addClass('active');
		window.location.hash = page;
	})
	

		jQuery('.animation-example img').removeClass('scroll-triggered');
		jQuery('.animation-example img').show();
		setTimeout(function(){
			jQuery('.animation-example img').addClass('scroll-triggered');	
		}, 500);

	setInterval(function(){
		jQuery('.animation-example img').hide();
		setTimeout(function(){
			jQuery('.animation-example img').removeClass('scroll-triggered');
			jQuery('.animation-example img').show();
		}, 50);
		setTimeout(function(){
			jQuery('.animation-example img').addClass('scroll-triggered');	
		}, 500);
	}, 2800);
	
	jQuery('.easy-animations-list li').on('click', function(){
			var animation = jQuery(this).attr('data-animation');
			jQuery('body').append('<input id="animation-copy" type="text" value="'+animation+'">');
			jQuery('#animation-copy').select();
			document.execCommand("copy");
			jQuery('#animation-copy').remove();
			
			jQuery(this).addClass('copied');
				  
			setTimeout(function(){
				jQuery('.easy-animations-list li').removeClass('copied');
			}, 1200);
	})

	if(window.location.hash){
		var page = window.location.hash.replace('#', '');
		jQuery('.header-nav li[data-name="'+page+'"]').trigger('click');
	}
	
})