<?php

add_action( 'greenlet_main_container', function() {
	remove_action( 'greenlet_entry_content', 'greenlet_do_entry_content' );
});

/**
 * SKAI site scripts.
 */
function skf_scripts() {
	greenlet_enqueue_style( 'site-home', GREENLET_CHILD_URL . '/assets/css/home.css' );
	greenlet_enqueue_script( 'site-home', GREENLET_CHILD_URL . '/assets/js/home.js', array(), SITE_VERSION, true );
	wp_localize_script( 'site-home', 'skSite', array( 'home' => get_home_url() ) );
}

add_action( 'wp_enqueue_scripts', 'skf_scripts', 20 );

get_header();

do_action( 'greenlet_before_main_container' );

get_template_part( 'frontend/home' );

do_action( 'greenlet_after_main_container' );

get_footer();
