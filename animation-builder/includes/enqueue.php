<?php function anibu_backend_scripts($hook){
	if($hook == 'toplevel_page_animation_builder') {
		wp_enqueue_script( 'anibu_backend_js', ANIBU_DIRECTORY . 'assets/js/backend.js', array(), null, true);
		wp_enqueue_style( 'anibu_backend_css', ANIBU_DIRECTORY . 'assets/css/backend.css');
		wp_enqueue_style( 'anibu_animations_css', ANIBU_DIRECTORY . 'assets/css/frontend.css');
	}
}
add_action('admin_enqueue_scripts', 'anibu_backend_scripts');

function anibu_frontend_scripts($hook){

	//Animations
	$anibu_options = get_option( 'anibu_options' );
	if(! isset($anibu_options['disable_animations']) || $anibu_options['disable_animations'] == false): 

		wp_enqueue_script('jquery');

		if(isset($anibu_options['gsap_url']) && $anibu_options['gsap_url'] != null){
			wp_enqueue_script('anibu_gsap', esc_url($anibu_options['gsap_url']), array(), null, true);
		}

		if(isset($anibu_options['gsap_scroll_trigger_url']) && $anibu_options['gsap_scroll_trigger_url'] != null){
			wp_enqueue_script('anibu_gsap_scroll_trigger', esc_url($anibu_options['gsap_scroll_trigger_url']), array(), null, true);
		}

		if(isset($anibu_options['gsap_scroll_trigger_url']) && $anibu_options['gsap_scroll_trigger_url'] != null && isset($anibu_options['gsap_url']) && $anibu_options['gsap_url'] != null){
			wp_enqueue_script( 'anibu_core_js', ANIBU_DIRECTORY . 'assets/js/core-elements.js', array('jquery', 'anibu_gsap', 'anibu_gsap_scroll_trigger'), null, true);
			wp_localize_script('anibu_core_js', 'anibu_options', $anibu_options);
			wp_enqueue_style( 'anibu_animations_css', ANIBU_DIRECTORY . 'assets/css/frontend.css');
			wp_enqueue_script('anibu_builder_animations', ANIBU_DIRECTORY . 'assets/js/builder-animations.js', array('anibu_core_js', 'jquery', 'anibu_gsap', 'anibu_gsap_scroll_trigger'), null, true);
			
			$animations = [
				'page' => get_post_meta(get_the_ID(), 'anibu_page_animations', true)
			];
			wp_localize_script('anibu_builder_animations', 'anibu', $animations);
		}
	endif;


	//Builder
	if(isset($_GET['animation_builder']) && $_GET['animation_builder'] == 'true' && current_user_can('manage_options')){
		$page_animations = get_post_meta(get_the_ID(), 'anibu_page_animations', true);
		wp_enqueue_style('anibu_colorpicker_css', ANIBU_DIRECTORY . 'assets/css/spectrum.min.css');
        wp_enqueue_script('anibu_vue', ANIBU_DIRECTORY . 'assets/js/vue.js', array(), null, true);
        wp_enqueue_script('anibu_colorpicker_js', ANIBU_DIRECTORY . 'assets/js/spectrum.js', array(), null, true);

        wp_enqueue_script('jquery-ui-core');
        wp_enqueue_script('jquery-ui-widget');
        wp_enqueue_script('jquery-ui-mouse'); 
        wp_enqueue_script('jquery-ui-draggable');
		wp_enqueue_style('anibu_builder_css', ANIBU_DIRECTORY . 'assets/css/builder.css');
		wp_enqueue_script('anibu_builder_js', ANIBU_DIRECTORY . 'assets/js/builder.js', array('anibu_vue', 'anibu_colorpicker_js', 'jquery', 'jquery-ui-sortable'), null, true);

		wp_dequeue_script( 'anibu_core_js');
		wp_dequeue_style( 'anibu_animations_css');

		if(!$page_animations){
			$page_animations = [];
		}

		if(! get_option('anibu_global_animations')){
			$global_animations = [];
		}else{
			$global_animations = get_option('anibu_global_animations');
		}
		
		if(isset($anibu_options['gsap_url'])):
			$gsap_url = $anibu_options['gsap_url'];
		else:
			$gsap_url = null;
		endif;
		if(isset($anibu_options['gsap_scroll_trigger_url'])):
			$gsap_scroll_trigger_url = $anibu_options['gsap_scroll_trigger_url'];
		else:
			$gsap_scroll_trigger_url = null;
		endif;

		$builder_data = array(
			'anibu_directory' => ANIBU_DIRECTORY,
			'page_url' => get_permalink(),
			'page_id' => get_the_ID(),
			'admin_url' => admin_url(),
			'ajax_endpoint' => admin_url( 'admin-ajax.php' ),
			'page_animations' => $page_animations,
			'global_animations' => $global_animations,
			'nonce' => wp_create_nonce('anibu_frontend_nonce'),
			'pro' => defined('ANIBU_PRO'),
			'gsap_url' => $gsap_url,
			'gsap_scroll_trigger_url' => $gsap_scroll_trigger_url
		);
		wp_localize_script('anibu_builder_js', 'anibu', $builder_data);
	}
}
add_action('wp_enqueue_scripts', 'anibu_frontend_scripts');