<?php
/*
 * Plugin Name: Coming Soon
 * Description: Coming soon countdown and maintenance mode
 * Version: 1.0.0
 * Author: Karthik
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . '/admin.php';

// Maintenance Mode
function soon_maintenance_mode() {
	if ( ! get_option( 'soon_maintenance' ) || current_user_can( 'manage_options' ) ) {
		return;
	}

	// We're in maintenance mode and the user is not an admin
	status_header( 503 );
	header( 'Retry-After: 3600' );

	// Simple modern page
	?>
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Maintenance</title>
		<style>
			body {
				font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
				background-color: #f8fafc;
				color: #334155;
				text-align: center;
			}
			.container {
				max-width: 500px;
				padding: 2rem;
			}
			h1 {
				font-size: 2.5rem;
				font-weight: 700;
				margin-bottom: 1rem;
				color: #0f172a;
			}
			p {
				font-size: 1.125rem;
				line-height: 1.5;
				color: #475569;
			}
			svg {
				width: 80px;
				height: 80px;
				margin-bottom: 1.5rem;
				color: #3b82f6;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<img src="/wp-content/themes/dc/assets/img/digicomp.svg" alt="Digicomp" style="max-width: 200px; margin-bottom: 2rem;">
			<br>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
			</svg>
			<h1>We'll be right back</h1>
			<p>We are currently performing some scheduled maintenance. We'll be back online shortly.</p>
		</div>
	</body>
	</html>
	<?php
	exit;
}
add_action( 'template_redirect', 'soon_maintenance_mode', 1 );

// Countdown Logic
function soon_is_active() {
	return get_option( 'cd_active' ) ? true : false;
}

function soon_get_countdown_html() {
	if ( ! soon_is_active() ) {
		return '';
	}

	$lauch_time = get_option( 'lauch_time' );
	$ajaxurl = admin_url( 'admin-ajax.php' );
	$isAdmin = current_user_can( 'manage_options' ) ? 'true' : 'false';
	$plugin_url = GREENLET_CHILD_URL . '/plugins/soon';

	ob_start();
	?>
	<link rel="stylesheet" href="<?php echo $plugin_url; ?>/soon.css">
	<script src="https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js"></script>
	<script>
		document.body.classList.add('cd-active');
		var countdown = {
			ajaxurl: '<?php echo $ajaxurl; ?>',
			time: '<?php echo $lauch_time; ?>',
			isAdmin: <?php echo $isAdmin; ?>
		};
	</script>
	<script src="<?php echo $plugin_url; ?>/soon.js"></script>
	<?php
	return ob_get_clean();
}

// Keep AJAX endpoints
function cd_launch() {
	echo wp_json_encode( update_option( 'cd_active', '' ) ? 1 : 0 );
	wp_die();
}
add_action( 'wp_ajax_launch', 'cd_launch' );
add_action( 'wp_ajax_nopriv_launch', 'cd_launch' );

function check_active() {
	echo wp_json_encode( get_option( 'cd_active', 1 ) ? 1 : 0 );
	wp_die();
}
add_action( 'wp_ajax_check_active', 'check_active' );
add_action( 'wp_ajax_nopriv_check_active', 'check_active' );
