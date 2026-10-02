<?php function anibu_convert_strings_to_booleans(array $array): array {
    foreach ($array as $key => &$value) {
        if (is_array($value)) {
            $value = anibu_convert_strings_to_booleans($value);
        } elseif (is_string($value)) {
            $lower_value = strtolower($value);
            
            if ($lower_value === 'true') {
                $value = true;
            } elseif ($lower_value === 'false') {
                $value = false;
            }
        }
    }
    return $array;
}

function anibu_recursive_sanitize_array($data) {
    if (is_array($data)) {
        return array_map('anibu_recursive_sanitize_array', $data);
    } elseif (is_string($data)) {
        return sanitize_text_field($data);
    } elseif (is_numeric($data)) {
        return $data + 0; // keeps int/float as numeric
    } elseif (is_bool($data)) {
        return (bool) $data;
    }
    return $data;
}

function anibu_save_animation(){
    check_ajax_referer('anibu_frontend_nonce', 'nonce');
    
    if(current_user_can('manage_options') && isset($_POST['animation'])){
        $animation = anibu_convert_strings_to_booleans(anibu_recursive_sanitize_array($_POST['animation']));
        $current_user = wp_get_current_user();
        $animation['user_email'] = $current_user->user_email;
        $animation['updated_at'] = time();
        
        if(! isset($animation['new'])){
            $animation['new'] = true;
        }else{
            $animation['new'] = false;
        }

        $animation = anibu_convert_strings_to_booleans($animation);
        $animation['saving'] = false;

        $page_animations = anibu_recursive_sanitize_array(get_post_meta($_POST['page'], 'anibu_page_animations', true));
        $global_animations = anibu_recursive_sanitize_array(get_option('anibu_global_animations'));
        if(!is_array($page_animations)){
            $page_animations = array();
        }
        if(!is_array($global_animations)){
            $global_animations = array();
        }

        unset($page_animations[$animation['id']]);
        unset($global_animations[$animation['id']]);

        if(! defined('ANIBU_PRO')){
            $animation['type'] = 'page';
            $animation['global'] = 'page';
            $animation['play_once'] = false;
            $animation['scrub_delay'] = null;
            $animation['disable_below'] = null;
            $animation['disable_above'] = null;

            if(isset($animation['stages']) && is_array($animation['stages'])){
                foreach($animation['stages'] as $key => $stage){
                    $animation['stages'][$key]['delay'] = null;
                    $animation['stages'][$key]['overlap'] = false;
                }
            }

        }


        if($animation['type'] == 'page'){
            $page_animations[$animation['id']] = $animation;
        }

        if($animation['type'] == 'global'){
            $global_animations[$animation['id']] = $animation;
        }

        update_post_meta($_POST['page'], 'anibu_page_animations', anibu_recursive_sanitize_array($page_animations));
        update_option('anibu_global_animations', anibu_recursive_sanitize_array($global_animations));

        $page_animations = anibu_recursive_sanitize_array(get_post_meta($_POST['page'], 'anibu_page_animations', true));
        $global_animations = anibu_recursive_sanitize_array(get_option('anibu_global_animations'));

        $animations = [
            'page' => $page_animations,
            'global' => get_option('anibu_global_animations')
        ];
        echo wp_json_encode($animations);

    wp_die(); 
    }

}
add_action('wp_ajax_anibu_save_animation', 'anibu_save_animation');

function anibu_delete_animation(){
    check_ajax_referer('anibu_frontend_nonce', 'nonce');
    
    if(current_user_can('manage_options')){

        $animation_id = $_POST['animation_id'];
        $page_animations = anibu_recursive_sanitize_array(get_post_meta($_POST['page'], 'anibu_page_animations', true));
        unset($page_animations[$animation_id]);
        $global_animations = anibu_recursive_sanitize_array(get_option('anibu_global_animations'));
        unset($global_animations[$animation_id]);
        update_post_meta($_POST['page'], 'anibu_page_animations', anibu_recursive_sanitize_array($page_animations));
        update_option('anibu_global_animations', $global_animations);

        $page_animations = anibu_recursive_sanitize_array(get_post_meta($_POST['page'], 'anibu_page_animations', true));
        $global_animations = anibu_recursive_sanitize_array(get_option('anibu_global_animations'));

        $animations = [
            'page' => $page_animations,
            'global' => get_option('anibu_global_animations')
        ];
        echo wp_json_encode($animations);

    }
    wp_die();
}
add_action('wp_ajax_anibu_delete_animation', 'anibu_delete_animation');

function anibu_save_library_settings() {
    check_ajax_referer('anibu_frontend_nonce', 'nonce');

    if(current_user_can('manage_options')){

        $anibu_options = anibu_recursive_sanitize_array(get_option( 'anibu_options' ));
        $anibu_options['gsap_url'] = sanitize_url($_POST['gsap_url']);
        $anibu_options['gsap_scroll_trigger_url'] = sanitize_url($_POST['gsap_scroll_trigger_url']);
        update_option('anibu_options', $anibu_options );
        return true;
    }

 wp_die();  }
add_action('wp_ajax_anibu_save_library_settings', 'anibu_save_library_settings');