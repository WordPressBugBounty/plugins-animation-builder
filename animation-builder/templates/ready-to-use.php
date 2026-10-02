<?php if(! defined('ABSPATH')) exit; ?>

<div class="page" data-name="easy">
	<h2 class="page-title">Ready-to-use CSS Classes</h2>
	<div class="page-content">
		
		<div class="area-wrap">
			<h3>Class reference</h3>
			<p>Use any of the predefined CSS animation classes below. Click on an example to copy it to your clipboard.</p>
			
			<ul class="easy-animations-list">
				<?php $predefined_animations = array(
					'fade-in' => 'Fade in an element',
					'fade-in-left' => 'Fade in an element from the left',
					'fade-in-right' => 'Fade in an element from the right',
					'fade-in-up' => 'Fade in an element from the top',
					'bounce-in-left' => 'Bounce in an element from the left',
					'bounce-in-right' => 'Bounce in an element from the right',
					'bounce-in-up' => 'Bounce in an element from the top',
					'bounce-in-down' => 'Bounce in an element from the bottom',
					'grow-left' => 'Grow an element from the left',
					'grow-right' => 'Grow an element from the right',
					'grow-up' => 'Grow an element from the top',
					'grow-down' => 'Grow an element from the bottom',
					'rubber-band' => 'Rubber band an element',
					'skew-in-left' => 'Skew in an element from the left',
					'skew-in-right' => 'Skew in an element from the right',
					'flip-left' => 'Flip an element from the left',
					'flip-right' => 'Flip an element from the right',
					'flip-up' => 'Flip an element from the top',
					'flip-down' => 'Flip an element from the bottom',
					'move-in-left' => 'Move an element from the left',
					'move-in-right' => 'Move an element from the right',
					'move-in-up' => 'Move an element from the top',
					'move-in-down' => 'Move an element from the bottom',
					'swing-forward' => 'Swing an element forward',
					'swing-side' => 'Swing an element side to side',
					'zoom-in' => 'Zoom in an element',
					'shake' => 'Shake an element',
					'blur-in' => 'Blur in an element',
					'colour-gain' => 'Colour gain an element',
				); ?>
				<?php foreach($predefined_animations as $key => $value): ?>
				<li data-animation="<?php echo esc_html($key); ?>" class="animation-list-item">
					<div class="animation-list-item-content">
						<div class="animation-list-item-class-wrapper">
							<div class="animation-list-item-class"><?php echo esc_html($key); ?></div>
							<div class="copy-icon" style="background-image:url('<?php echo esc_html(ANIBU_DIRECTORY); ?>assets/images/copy.svg');"></div>
						</div>
						<p><?php echo esc_html($value); ?></p>
					</div>
					<div class="animation-example">
						<img src="<?php echo esc_html(ANIBU_DIRECTORY); ?>/assets/images/icon-dark.svg" class="<?php echo esc_html($key); ?> ab-triggered">
					</div>
				</li>
				<?php endforeach; ?>
			</ul>
		</div>
		
		<div class="area-wrap additional-controls">
			<h3>Additional Controls</h3>
			<p>Combine the classes above with the options below for more control over your animations.</p>
			<ul class="easy-animations-list additional-classes">
				<li data-animation="speed-xxx" class="animation-list-item">
					<div class="animation-list-item-content">
						<div class="animation-list-item-class-wrapper">
							<div class="animation-list-item-class">speed-xxx</div>
							<div class="copy-icon" style="background-image:url('<?php echo esc_html(ANIBU_DIRECTORY); ?>assets/images/copy.svg');"></div>
						</div>
						<p>Replace 'xxx' with the speed in ms. 1000 = 1 second</p>
					</div>
				</li>
				<li data-animation="delay-xxx" class="animation-list-item">
					<div class="animation-list-item-content">
						<div class="animation-list-item-class-wrapper">
							<div class="animation-list-item-class">delay-xxx</div>
							<div class="copy-icon" style="background-image:url('<?php echo esc_html(ANIBU_DIRECTORY); ?>assets/images/copy.svg');"></div>
						</div>
						<p>Replace 'xxx' with the delay in ms. 1000 = 1 second</p>
					</div>
				</li>
			</ul>
		</div>
	</div>
</div>