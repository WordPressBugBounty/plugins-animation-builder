<?php if(! defined('ABSPATH')) exit; ?>

<div class="page" data-name="settings">
	<h2 class="page-title">Settings</h2>
	<div class="page-content">

    <div class="area-wrap">
        <h3>General Settings</h3>
        <p>Configure the general settings for <strong>AnimationBuilder</strong></p>
        
        <?php $anibu_options = get_option( 'anibu_options' ); ?>
        <form method="POST">

            <?php if(isset($_POST['action']) && $_POST['action'] == 'save_settings'): ?>
                <?php check_admin_referer('anibu_save_settings', 'anibu_nonce'); ?>
                <?php $checkbox_fields = array('disable_animations', 'repeat_core_animations'); ?>

                <?php foreach($checkbox_fields as $field): ?>
                    <?php if(isset($_POST[$field])): ?>
                        <?php $anibu_options[$field] = true; ?>
                    <?php else: ?>
                        <?php $anibu_options[$field] = false; ?>
                    <?php endif; ?>
                <?php endforeach; ?>

                <?php $input_fields = array('offset_pixels', 'activated_elements', 'gsap_url', 'gsap_scroll_trigger_url'); ?>

                <?php foreach($input_fields as $field): ?>
                    <?php if(isset($_POST[$field])): ?>
                        <?php $anibu_options[$field] = sanitize_text_field($_POST[$field]); ?>
                    <?php endif; ?>
                <?php endforeach; ?>
                
                <?php update_option( 'anibu_options', $anibu_options ); ?>

            <?php endif; ?>

            <div class="option-area">

                <label class="option checkbox-area">
                    <input type="checkbox" name="disable_animations" <?php if(isset($anibu_options['disable_animations']) && $anibu_options['disable_animations'] == true): ?>checked<?php endif; ?>>
                    <div class="label-area">
                        <div class="option-title">Disable ALL animations</div>
                        <p>Check this box to disable all <strong>AnimationBuilder</strong> configured animations.</p>
                    </div>
                </label>

            </div>

        </div>

        <div class="area-wrap">

            <h3>Ready-to-use class settings</h3>
            <div class="option-area">

                <label class="option checkbox-area">
                    <input type="checkbox" name="repeat_core_animations" <?php if(isset($anibu_options['repeat_core_animations']) && $anibu_options['repeat_core_animations'] == true): ?>checked<?php endif; ?>>
                    <div class="label-area">
                        <div class="option-title">Repeat “Ready-to-use” animations?</div>
                        <p>Enable this option to replay the core “ready-to-use” animations every time the element re-enters the viewport. By default, these animations run only once when the element first scrolls into view from the bottom of the screen.</p>
                    </div>
                </label>

                 <div class="option inset">
                    <div class="option-title">"Ready-to-use" class offset</div>
                    <p>Choose how many pixels above the bottom of the viewport the “ready-to-use” animations should begin. Increasing this value makes the animations trigger earlier (higher up) as the user scrolls, while lowering it makes them trigger later (closer to the bottom of the screen).</p>
                    <div class="append-px">
                        <input type="number" name="offset_pixels" <?php if(isset($anibu_options['offset_pixels'])): ?>value="<?php echo esc_attr($anibu_options['offset_pixels']); ?>"<?php endif; ?>>
                    </div>
                </div>

            </div>

        </div>

        <div class="area-wrap">

            <h3>Legacy Activations</h3>
            <div class="option-area">

                 <div class="option">
                    <div class="option-title">Activated Elements</div>
                    <p>When an element is activated, the plugin automatically adds a CSS class to it when it enters the viewport. This lets you define your own CSS transitions or animations between its default and active states. The class added is ".scroll-triggered" <strong>Please note:</strong> The options set above for "Ready-to-use" animations will also apply to activated elements.</p>
                    <input type="text" name="activated_elements" placeholder="Comma seperated list of CSS selectors." <?php if(isset($anibu_options['activated_elements'])): ?>value="<?php echo esc_attr($anibu_options['activated_elements']); ?>"<?php endif; ?>>
                </div>

            </div>

        </div>

         <div class="area-wrap">

            <h3>Animation Library</h3>
            <p>Click "Save Settings" to enqueue the 2 required assets below.</p>
            <div class="option-area">

                <div class="option">
                    <div class="option-title">GSAP CDN URL</div>
                    <input type="text" name="gsap_url" value="<?php if(isset($anibu_options['gsap_url']) && $anibu_options['gsap_url']): ?><?php echo esc_url($anibu_options['gsap_url']); ?><?php endif; ?>">
                </div>

                <div class="option">
                    <div class="option-title">GSAP Scroll Trigger CDN URL</div>
                    <input type="text" name="gsap_scroll_trigger_url" value="<?php if(isset($anibu_options['gsap_scroll_trigger_url']) && $anibu_options['gsap_scroll_trigger_url']): ?><?php echo esc_url($anibu_options['gsap_scroll_trigger_url']); ?><?php endif; ?>">
                </div>

            </div>

        </div>

        <input type="hidden" name="action" value="save_settings">
        <?php wp_nonce_field('anibu_save_settings', 'anibu_nonce'); ?>
        <button class="ab-button">Save settings</button>

    </form>
		
	</div>
</div>