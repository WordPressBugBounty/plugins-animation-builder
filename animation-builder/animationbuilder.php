<?php
   /**
   * 
   * @license https://www.gnu.org/licenses/gpl-3.0.html 
   * 
   * Plugin Name: Animation Builder
   * Plugin URI: https://www.toastplugins.co.uk/plugins/animation-builder
   * Description: Complex scroll-triggered animations. No coding required.
   * Version: 5.1.2
   * Author: Toast Plugins
   * Author URI: https://www.toastplugins.co.uk/
   * Requires at least: 5.0
   * Requires PHP: 7.0
   * License: GPL-3.0
   * License URI: https://www.gnu.org/licenses/gpl-3.0.html
   * Text Domain: anibu
   */

   if(! defined('ABSPATH')) exit;

   if( ! class_exists('AnimationBuilder')):

      class AnimationBuilder {

         public $version = '5.1.2';

         function __construct() {
            //Do nothing
         }

         function initialise() {
            define('AnimationBuilder', true);
            define('ANIBU_PATH', plugin_dir_path( __FILE__ ));
            define('ANIBU_BASENAME', plugin_basename( __FILE__ ));
            define('ANIBU_DIRECTORY', plugin_dir_url( __FILE__ ));
            define('ANIBU_VERSION', $this->version);

            include ANIBU_PATH . '/includes/setup.php';
            include ANIBU_PATH . '/includes/enqueue.php';
            include ANIBU_PATH . '/includes/migration.php';
            include ANIBU_PATH . '/functions/anibu_save_animation.php';
         }

      }

      $AnimationBuilder = new AnimationBuilder();
      $AnimationBuilder->initialise();

   endif;





?>