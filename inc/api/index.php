<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once get_stylesheet_directory() . '/inc/api/home.php';
require_once get_stylesheet_directory() . '/inc/api/shop.php';
require_once get_stylesheet_directory() . '/inc/api/product.php';

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
}

add_action( 'rest_api_init', 'dc_register_api_routes' );
