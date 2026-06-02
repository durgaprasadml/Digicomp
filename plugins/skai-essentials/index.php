<?php
/**
 * Plugin Name: SKAI Essentials
 * Description: Essential functionalities for SKAI Site - Restrict login, webp upload, Stop Update Emails
 * Version: 1.0.0
 * Author: Karthik
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function restrict_login() {
	if ( 'skaiworld.local' === $_SERVER['SERVER_NAME'] ) {
		return;
	}

	// For public visible website (skaiworld.com)
	// Show login page only if accessed with the token to keep bots and spammers away.
	if ( 1 === get_current_blog_id() ) {
		if ( 'wp-login.php' === $GLOBALS['pagenow'] &&
			false === strpos( $_SERVER['REQUEST_URI'], 'token=sk_kart' ) ) {
			wp_redirect( get_home_url(), 307 );
		}
	} elseif ( ! is_user_logged_in() && 'wp-login.php' !== $GLOBALS['pagenow'] ) {
		// Make all other subdomains under multisite network as private.
		global $wp;
		if ( wp_safe_redirect( wp_login_url( $wp->request ) ) ) {
			exit;
		}
	}

	// Todo: Causes error from cron
	// header_remove( 'X-Powered-By' );
}

add_action( 'init', 'restrict_login' );

/**
 * Enable upload for webp image files.
 */
function webp_upload_mimes( $existing_mimes ) {
	$existing_mimes['webp'] = 'image/webp';
	return $existing_mimes;
}

function webp_file_and_ext( $mime, $file, $filename, $mimes ) {
	$wp_filetype = wp_check_filetype( $filename, $mimes );
	if ( in_array( $wp_filetype['ext'], [ 'webp' ] ) ) {
		$mime['ext']  = 'webp';
		$mime['type'] = 'image/webp';
	}

	return $mime;
}

function add_webp_mime_type( $mimes ) {
	$mimes['webp'] = 'image/webp';
	return $mimes;
}

function webp_is_displayable( $result, $path ) {
	if ( false === $result ) {
		$displayable_image_types = array( IMAGETYPE_WEBP );
		$info = @getimagesize( $path );

		if ( empty( $info ) ) {
			$result = false;
		} elseif ( ! in_array( $info[2], $displayable_image_types ) ) {
			$result = false;
		} else {
			$result = true;
		}
	}

	return $result;
}

add_filter( 'mime_types', 'webp_upload_mimes' );
add_filter( 'upload_mimes', 'add_webp_mime_type' );
add_filter( 'wp_check_filetype_and_ext', 'webp_file_and_ext', 10, 4 );
add_filter( 'file_is_displayable_image', 'webp_is_displayable', 99, 2 );

function gl_security_headers($headers) {
	if ( ! is_admin() ) {
		$headers['content-security-policy'] = "default-src 'self' 'unsafe-inline' https: data:";
	}
	// $headers['x-powered-by'] = 'PHP/X';
	return $headers;
}

function gl_remove_generator() {
	return '';
}

add_filter( 'wp_headers', 'gl_security_headers' );
add_filter( 'the_generator','gl_remove_generator' );
remove_action( 'wp_head', 'wp_generator' );

add_filter( 'show_admin_bar', '__return_false' );

add_filter( 'auto_core_update_send_email', 'sk_stop_update_emails', 10, 4 );

function sk_stop_update_emails( $send, $type, $core_update, $result ) {
	if ( ! empty( $type ) && 'success' === $type ) {
		return false;
	}
	return true;
}

add_filter( 'auto_theme_update_send_email', '__return_false' );

add_filter( 'auto_plugin_update_send_email', '__return_false' );

function sk_remove_job_meta() {
	if ( 'awsm_job_openings' === get_post_type() ) {
		remove_action( 'greenlet_post_meta', 'greenlet_post_meta' );
		remove_action( 'greenlet_entry_footer', 'greenlet_do_entry_footer' );
	}
}

add_action( 'greenlet_main_container', 'sk_remove_job_meta' );

// Replace "Out of stock" with a custom button
add_filter( 'woocommerce_get_availability', 'custom_out_of_stock_button', 10, 2 );
function custom_out_of_stock_button( $availability, $_product ) {

	if ( ! $_product->is_in_stock() ) {
		$availability['availability'] = '<a href="tel:+917026009070" class="button skai-call-button">Call now</a>';
	}
	return $availability;
}

// Replace Unipixel script
function skai_unipixel_replace_scripts() {
	wp_dequeue_script( 'unipixel-tracker-meta' );

	global $wpdb;
	$platform_id = 1; // Assuming platform_id for Meta is 1, adjust as necessary
	$table_name = $wpdb->prefix . 'unipixel_platform_settings';

	if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) !== $table_name ) {
		return;
	}

	// Get platform settings
	$query = $wpdb->prepare(
		"SELECT * FROM %i WHERE id = %d",
		$table_name,
		$platform_id,
	);

	$platformSettings = $wpdb->get_row($query, ARRAY_A);

	$platformEnabled            = ! empty($platformSettings['platform_enabled']);
	$sendPageViewServerSide     = ! empty($platformSettings['pageview_send_serverside']);
	$metaPixelId                = isset($platformSettings['pixel_id']) ? esc_js($platformSettings['pixel_id']) : '';

	if (! $platformEnabled || ! $metaPixelId) {
		return;
	}

	$events = unipixel_get_events_for_platform($platform_id);

	// Prepare the events array for localization
	$eventsToTrack = array_map(function ($event) {
		return [
			'elementRef' => $event['element_ref'],
			'trigger' => $event['event_trigger'],
			'name' => $event['event_name'],
			'event_id' => uniqid('', true) // Generate unique event_id for each event
		];
	}, $events);

	//Add PageView event //firing conditions determined later
	array_unshift($eventsToTrack, [
		'elementRef' => 'body',
		'trigger'    => 'shown',
		'name'       => 'PageView',
		'event_id'   => uniqid('pv_', true),
	]);

	$script_url = GREENLET_CHILD_URL . '/plugins/skai-essentials/unipixel-meta-tracker.js';
	wp_enqueue_script( 'skai-tracker-meta', $script_url, array(), null, true);

	wp_localize_script( 'skai-tracker-meta', 'UniPixelEventDataMeta', array(
		'eventsToTrack' => $eventsToTrack,
		'customData' => array(),
		'ajaxurl' => admin_url('admin-ajax.php'),
		'nonce' => wp_create_nonce('unipixel_track_nonce')
	) );
}
add_action( 'wp_enqueue_scripts', 'skai_unipixel_replace_scripts', 21 );

require_once( __DIR__ . '/profilepic.php' );
