<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once get_stylesheet_directory() . '/inc/api/home.php';
require_once get_stylesheet_directory() . '/inc/api/shop.php';
require_once get_stylesheet_directory() . '/inc/api/product.php';
require_once get_stylesheet_directory() . '/inc/api/checkout.php';
require_once get_stylesheet_directory() . '/inc/api/post.php';
require_once get_stylesheet_directory() . '/inc/api/my-account.php';
require_once get_stylesheet_directory() . '/inc/api/wishlist.php';

function dc_api_routes() {
	return [
		'home' => [
			'callback' => 'dc_api_get_home',
			'get_head' => 'dc_api_home_head',
		],
		'shop' => [
			'callback' => 'dc_api_get_shop',
			'get_head' => 'dc_api_shop_head',
		],
		'product-category/(?P<cat>[a-zA-Z0-9-]+)' => [
			'callback' => 'dc_api_get_shop',
			'get_head' => 'dc_api_taxonomy_head',
		],
		'product-tag/(?P<tag>[a-zA-Z0-9-]+)' => [
			'callback' => 'dc_api_get_shop',
			'get_head' => 'dc_api_taxonomy_head',
		],
		'brand/(?P<brand>[a-zA-Z0-9-]+)' => [
			'callback' => 'dc_api_get_shop',
			'get_head' => 'dc_api_taxonomy_head',
		],
		'product/(?P<slug>[a-zA-Z0-9-]+)' => [
			'callback' => 'dc_api_get_product',
			'get_head' => 'dc_api_product_head',
		],
		'cart' => [
			'callback' => 'dc_api_cart_data',
			'get_head' => 'dc_api_cart_head',
			'ssr'      => false,
		],
		'checkout' => [
			'callback' => 'dc_api_checkout_data',
			'get_head' => 'dc_api_checkout_head',
			'ssr'      => false,
		],
		'my-account(?:/(?P<tab>[a-z0-9-]+)(?:/(?P<id>[0-9]+))?)?' => [
			'callback' => 'dc_api_my_account_data',
			'get_head' => 'dc_api_my_account_head',
			'ssr'      => false,
		],
		'wishlist(?:/(?P<id>[0-9a-fA-F-]+))?' => [
			'callback' => 'dc_api_wishlist_data',
			'get_head' => '__return_empty_array',
			'ssr'      => false,
		],
		'blog/(?P<slug>[a-z0-9-]+)' => [
			'callback' => 'dc_api_post_data',
			'get_head' => 'dc_api_post_head',
			'type'     => 'post',
		],
		'(?P<slug>[a-z0-9-]+)' => [
			'callback' => 'dc_api_page_data',
			'get_head' => 'dc_api_page_head',
			'type'     => 'page',
		],
	];
}

function dc_api_cart_data() {
	return new \WP_REST_Response( [ 'head' => dc_api_cart_head() ] );
}

function dc_api_cart_head() {
	return [
		'title' => 'Shopping Cart - Digicomp Technologies',
		'desc'  => 'Review your items and proceed to checkout.',
	];
}

function dc_register_api_routes() {
	$routes = dc_api_routes();
	// Register frontend page routes
	foreach ( $routes as $route => $args ) {
		register_rest_route('dc/v1', '/' . $route, [
			'methods'             => 'GET',
			'callback'            => $args['callback'],
			'permission_callback' => '__return_true'
		] );
	}
	// Register other routes
	register_rest_route('dc/v1', '/my-account/update', [
		'methods'             => 'POST',
		'callback'            => 'dc_api_my_account_update',
		'permission_callback' => '__return_true'
	] );
	register_rest_route('dc/v1', '/wishlist/create', [
		'methods'             => 'POST',
		'callback'            => 'dc_api_wishlist_create',
		'permission_callback' => '__return_true'
	] );
	register_rest_route('dc/v1', '/wishlist/delete/(?P<id>[0-9a-fA-F-]+)', [
		'methods'             => 'POST, DELETE',
		'callback'            => 'dc_api_wishlist_delete',
		'permission_callback' => '__return_true'
	] );
	register_rest_route('dc/v1', '/wishlist/(?P<id>[0-9a-fA-F-]+)/add', [
		'methods'             => 'POST',
		'callback'            => 'dc_api_wishlist_add_item',
		'permission_callback' => '__return_true'
	] );
	register_rest_route('dc/v1', '/wishlist/(?P<id>[0-9a-fA-F-]+)/remove', [
		'methods'             => 'POST',
		'callback'            => 'dc_api_wishlist_remove_item',
		'permission_callback' => '__return_true'
	] );
}

add_action( 'rest_api_init', 'dc_register_api_routes' );
