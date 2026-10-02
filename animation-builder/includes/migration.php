<?php function anibu_migrate_old_settings(){

    $sta_options = get_option( 'toast_sta_settings' );
    $anibu_options = get_option( 'anibu_options' );
    if($sta_options):

        if(! isset($anibu_options['migration']) || $anibu_options['migration'] < 5):
            if(isset($sta_options['toast_sta_advanced_animations'])):
                $anibu_options['activated_elements'] = $sta_options['toast_sta_advanced_animations'];
            endif;

            if(isset($sta_options['disable_all']) && $sta_options['disable_all'] == 'on'):
                $anibu_options['disable_animations'] = true;
            endif;

            if(isset($sta_options['toast_sta_repeat_animations']) && $sta_options['toast_sta_repeat_animations'] == 'on'):
                $anibu_options['repeat_core_animations'] = true;
            endif;

            if(isset($sta_options['toast_sta_position_start'])):
                $anibu_options['offset_pixels'] = $sta_options['toast_sta_position_start'];
            endif;

            $anibu_options['migration'] = 5;

            update_option( 'anibu_options', $anibu_options );

        endif;

    endif;

}
add_action('wp_head', 'anibu_migrate_old_settings');
add_action('admin_head', 'anibu_migrate_old_settings');

function anibu_deactivate_conflicts() {
    $anibu_options = get_option( 'anibu_options' );
    $plugins_to_deactivate = array('scroll-triggered-animations/toaststa.php', 'scroll-triggered-animations-pro-extension/sta-pro.php');

    foreach( $plugins_to_deactivate as $plugin_to_deactivate ) {
        if ( is_plugin_active( $plugin_to_deactivate ) ) {
            deactivate_plugins( $plugin_to_deactivate, false, false );

            add_action( 'admin_notices', function() use ( $plugin_to_deactivate ) { ?>
                <div class="error">
                    <?php if($plugin_to_deactivate == 'scroll-triggered-animations/toaststa.php'): ?>
                        <p><strong>Scroll Triggered Animations</strong> has been automatically deactivated by <strong>Animation Builder</strong> to prevent conflicts. Please confirm your animation settings have been migrated correctly <a href="<?php echo admin_url('admin.php?page=animation_builder'); ?>">here</a></p>
                    <?php else: ?>
                        <p><strong>Scroll Triggered Animations Pro Extension</strong> has been automatically deactivated by <strong>Animation Builder</strong> to prevent conflicts.</p>
                    <?php endif; ?>
                </div>
            <?php });
        }   
    }

    if(isset($anibu_options['migration']) && ! isset($anibu_options['gsap_url']) && ! isset($anibu_options['gsap_scroll_trigger_url'])):
         add_action( 'admin_notices', function() { ?>
            <div class="error">
                <p>You’ve migrated from <strong>Animator (STA)</strong> to <strong>Animation Builder</strong>. To ensure your existing animations continue to work, please install GSAP <a target="_blank" href="<?php echo admin_url('admin.php?page=animation_builder'); ?>">here</a>.</p>
            </div>
        <?php });
    endif;
    
}
add_action( 'admin_init', 'anibu_deactivate_conflicts' );