<?php if(! defined('ABSPATH')) exit; ?>

<div class="ab-wrap wrap">
    <h1 class="screen-reader-text">Scroll Triggered Animations</h1>
    <div class="ab-body">
        <header class="ab-header">
            <a href="https://www.toastplugins.co.uk/" target="_blank" class="logo">
            <img src="<?php echo esc_html(ANIBU_DIRECTORY); ?>assets/images/logo-dark.svg">
            </a>
            <ul class="header-nav">
                <li class="active" data-name="comprehensive">
                    <h3>Animation Builder</h3>
                    The hub of your animations
                </li>
                <li data-name="easy">
                    <h3>Ready to use classes</h3>
                    Easy to install & manage <br>for everyone.
                </li>
                 <li data-name="settings">
                    <h3>Settings</h3>
                    Easy to install & manage <br>for everyone.
                </li>
            </ul>
        </header>
        <main class="ab-content">
            <?php include ANIBU_PATH . 'templates/comprehensive.php'; ?>
            <?php include ANIBU_PATH . 'templates/ready-to-use.php'; ?>
            <?php include ANIBU_PATH . 'templates/settings.php'; ?>
        </main>
    </div>
</div>