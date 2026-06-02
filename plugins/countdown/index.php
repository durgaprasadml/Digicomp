<?php
/*
 * Plugin Name: Countdown
 * Description: Countdown launcher
 * Version: 1.0.0
 * Author: Karthik
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __FILE__ ) . '/admin.php';

function my_body_classes( $classes ) {
	if ( get_option( 'cd_active' ) ) {
		$classes[] = 'cd-active';
	}
	return $classes;
}
add_filter( 'body_class', 'my_body_classes' );

function cd_enqueue_script() {
	if ( ! get_option( 'cd_active' ) ) {
		return;
	}

	wp_enqueue_script( 'confetti', 'https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js', array(), '2.9.3', true );
	wp_enqueue_script( 'cdjs', GREENLET_CHILD_URL . '/plugins/countdown/countdown.js', array( 'confetti' ), '1.0.0', true );
	wp_localize_script(
		'cdjs',
		'countdown',
		array(
			'ajaxurl' => admin_url( 'admin-ajax.php' ),
			'time' => get_option( 'lauch_time' ),
			'isAdmin' => current_user_can( 'manage_options' ),
		),
	);

	wp_enqueue_style( 'cd', GREENLET_CHILD_URL . '/plugins/countdown/countdown.css', array(), '1.0.0' );
}

add_action( 'wp_enqueue_scripts', 'cd_enqueue_script' );

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
