<?php 

function toast_anibu_menu(){ 
	add_menu_page('Animation Builder', 'Animation Builder', 'manage_options', 'animation_builder', 'anibu_options_page', ANIBU_DIRECTORY . 'assets/images/icon-white.svg');
}
add_action( 'admin_menu', 'toast_anibu_menu' );

function anibu_options_page(){ ?>
	<?php include ANIBU_PATH . '/templates/index.php'; ?>
<?php }


function init_anibu_builder(){
	$anibu_options = get_option( 'anibu_options' );
	$disabled = isset($anibu_options['disable_animations']) && $anibu_options['disable_animations'] == true;
    if(isset($_GET['animation_builder']) && $_GET['animation_builder'] == 'true' && current_user_can('manage_options') && ! $disabled){
        add_filter('show_admin_bar', '__return_false');
    }
}
add_action('init', 'init_anibu_builder');

function anibu_frontend_loading_screen(){ ?>
	<?php $anibu_options = get_option( 'anibu_options' ); ?>
	<?php $disabled = isset($anibu_options['disable_animations']) && $anibu_options['disable_animations'] == true; ?>
    <?php if(isset($_GET['animation_builder']) && $_GET['animation_builder'] == 'true' && current_user_can('manage_options') && ! $disabled): ?>
		<div class="ab-loading-screen">
			<div class="ab-loading-screen-logo"><img src="<?php echo esc_html(ANIBU_DIRECTORY); ?>assets/images/logo-white.svg"></div>
		</div>
	<?php endif; ?>
<?php }
add_action('wp_footer', 'anibu_frontend_loading_screen');

function anibu_add_admin_bar_item($wp_admin_bar) {

	$anibu_options = get_option( 'anibu_options' );
	$disabled = isset($anibu_options['disable_animations']) && $anibu_options['disable_animations'] == true;
	if(! $disabled):
		if(! is_admin()){
			$wp_admin_bar->add_node([
				'id'    => 'anibu_builder',
				'title' => '<img src="'. ANIBU_DIRECTORY . '/assets/images/logo-white.svg" style="height: 14px;padding: 9px 10px;background:#363B47;margin:0 -8px 0 -7px">',
				'href'  => get_the_permalink().'?animation_builder=true', 
			]);

			$wp_admin_bar->add_node([
				'id'     => 'anibu_builder_single',
				'parent' => 'anibu_builder',
				'title'  => 'Add animation to this page',
				'href'   => get_the_permalink().'?animation_builder=true',
			]);

			$wp_admin_bar->add_node([
				'id'     => 'anibu_builder_global',
				'parent' => 'anibu_builder',
				'title'  => 'Add global animation',
				'href'   => get_the_permalink().'?animation_builder=true&global=true',
			]);
			$wp_admin_bar->add_node([
				'id'     => 'anibu_builder_settings',
				'parent' => 'anibu_builder',
				'title'  => 'Settings',
				'href'   => admin_url('admin.php?page=animation_builder#settings'),
			]);
		}else{
			$wp_admin_bar->add_node([
				'id'    => 'anibu_builder',
				'title' => '<img src="'. ANIBU_DIRECTORY . '/assets/images/logo-white.svg" style="height: 14px;padding: 9px 10px;background:#363B47;margin:0 -8px 0 -7px">',
				'href'  => home_url('/').'?animation_builder=true', 
			]);
			$wp_admin_bar->add_node([
				'id'     => 'anibu_builder_settings',
				'parent' => 'anibu_builder',
				'title'  => 'Settings',
				'href'   => admin_url('admin.php?page=animation_builder#settings'),
			]);
		}
	endif;
}
add_action('admin_bar_menu', 'anibu_add_admin_bar_item', 100);

function anibu_plugin_links( $links ) {
    $settings_link = '<a href="'.home_url('/').'?animation_builder=true">Get started</a>';
	$docs_link = '<a href="https://toastplugins.co.uk/docs/animation-builder/" target="_blank">Docs</a>';
    
    $links[] = $settings_link;
    $links[] = $docs_link;
    
    return $links;
}
add_filter( 'plugin_action_links_' . ANIBU_BASENAME, 'anibu_plugin_links' );

function redirect_to_animation_builder_frontend(){

	if(isset($_GET['page']) && $_GET['page'] == 'animation_builder' && current_user_can('manage_options')){
		$anibu_options = get_option( 'anibu_options' );
		if(! isset($anibu_options['gsap_url']) || $anibu_options['gsap_url'] == null):
			wp_redirect(home_url('/').'?animation_builder=true&referrer='.$_SERVER['REQUEST_URI']);
			die();
		endif;
	}

}
add_action('admin_init', 'redirect_to_animation_builder_frontend');