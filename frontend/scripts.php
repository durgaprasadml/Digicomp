<?php

/**
 * Site scripts.
 */
function site_scripts() {
	$styles_href = GREENLET_CHILD_URL . '/style.css';
	greenlet_enqueue_style( 'site', $styles_href );

	if ( class_exists( 'WooCommerce' ) ) {
		greenlet_enqueue_style( 'site-woocommerce', GREENLET_CHILD_URL . '/assets/css/woocommerce.css' );
	}

	if ( is_front_page() ) {
		wp_dequeue_script( 'greenlet-scripts' );
		wp_dequeue_style( 'wedocs-styles' );
	} elseif ( 'cashback' === get_post_field( 'post_name' ) ) {
		greenlet_enqueue_style( 'cb', GREENLET_CHILD_URL . '/assets/css/cashback.css' );

		wp_enqueue_script( 'confetti', 'https://cdn.jsdelivr.net/npm/tsparticles-confetti@2.9.3/tsparticles.confetti.bundle.min.js', array(), '2.9.3', true );
		greenlet_enqueue_script( 'cbj', GREENLET_CHILD_URL . '/assets/js/cashback.js', array( 'confetti' ), SITE_VERSION, true );
	} elseif ( is_checkout() ) {
		greenlet_enqueue_style( 'site-checkout', GREENLET_CHILD_URL . '/assets/css/checkout.css' );

		greenlet_enqueue_script( 'site-checkout', GREENLET_CHILD_URL . '/assets/js/checkout.js', array(), SITE_VERSION, true );
	} elseif ( is_account_page() ) {
		greenlet_enqueue_style( 'site-account', GREENLET_CHILD_URL . '/assets/css/account.css' );
	}

	greenlet_enqueue_script('site-main', GREENLET_CHILD_URL . '/assets/js/script.js', array(), SITE_VERSION, true);
}

add_action( 'wp_enqueue_scripts', 'site_scripts', 20 );

/**
 * Deregister WP Embed script.
 */
function greenlet_deregister_scripts() {
	wp_deregister_script( 'wp-embed' );
}

add_action( 'wp_footer', 'greenlet_deregister_scripts' );

/**
 * Disable Emojis if opted.
 */
function sure_disable_emojis() {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
	remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
	remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
	remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
	add_filter( 'tiny_mce_plugins', 'disable_emojis_tinymce' );
	add_filter( 'wp_resource_hints', 'disable_emojis_remove_dns_prefetch', 10, 2 );
}

add_action( 'init', 'sure_disable_emojis' );

/**
 * Disable Tinymce emojis
 *
 * @param array $plugins Plugins.
 * @return array
 */
function disable_emojis_tinymce( $plugins ) {
	if ( is_array( $plugins ) ) {
		return array_diff( $plugins, array( 'wpemoji' ) );
	} else {
		return array();
	}
}

/**
 * Disable emojis DNS prefetch.
 *
 * @param array  $urls URLs.
 * @param string $relation_type Relation type.
 * @return array
 */
function disable_emojis_remove_dns_prefetch( $urls, $relation_type ) {
	if ( 'dns-prefetch' === $relation_type ) {
		$emoji_svg_url = apply_filters( 'emoji_svg_url', 'https://s.w.org/images/core/emoji/2/svg/' );

		$urls = array_diff( $urls, array( $emoji_svg_url ) );
	}
	return $urls;
}
