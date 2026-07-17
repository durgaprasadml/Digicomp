<?php

function dc_default_head() {
	return [
		'title' => 'Digicomp Technologies — Engineered for Innovators',
		'desc'  => 'Digicomp Technologies — Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.',
		'theme' => 'dark',
		'color' => '#FF6D33',
	];
}

function get_specific_data( $path = 'home', $has_ssr = true ) {
	$routes = dc_api_routes();
	$matched_route = null;
	$matches = [];

	foreach ( $routes as $route => $args ) {
		if ( preg_match( '#^' . $route . '$#', $path, $matches ) ) {
			$matched_route = $args;
			break;
		}
	}

	if ( ! $matched_route || ! isset( $matched_route['callback'] ) ) {
		return [];
	}

	$request = new \WP_REST_Request( 'GET', '/dc/v1/' . $path );
	foreach ( $matches as $key => $val ) {
		if ( is_string( $key ) ) {
			$request->set_param( $key, $val );
		}
	}

	if ( $has_ssr ) {
		// Only return head data.
		return [ 'head' => isset( $matched_route['get_head'] ) ? call_user_func( $matched_route['get_head'], $request ) : [] ];
	}

	$response = call_user_func( $matched_route['callback'], $request );
	if ( ! is_wp_error( $response ) ) {
		return $response->get_data();
	}
	return [];
}

function get_page_data( $path = 'home', $has_ssr = true ) {
	$data = [
		'homeUrl'   => get_home_url(),
		'dcApiUrl'  => get_home_url() . '/wp-json/dc/v1/',
		'stApiUrl'  => get_home_url() . '/wp-json/wc/store/v1/',
		'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
		'searchUrl' => get_home_url() . '/wp-content/plugins/ajax-search-for-woocommerce-premium/includes/Engines/TNTSearchMySQL/Endpoints/search.php',
		'currency'  => html_entity_decode( get_woocommerce_currency_symbol() ),
		'pages'     => [
			$path => [
				'head' => [],
			],
		],
	];

	$specific = get_specific_data( $path, $has_ssr );
	if ( ! empty( $specific ) ) {
		foreach ( $specific as $key => $value ) {
			if ( 'head' === $key ) {
				foreach ($specific['head'] as $hk => $hv) {
					$data['pages'][ $path ]['head'][ $hk ] = $hv;
				}
			} else {
				$data['pages'][ $path ][ $key ] = $value;
			}
		}
	}

	return $data;
}

function get_user_nonce_name() {
	return 'wc_store_api';
}

function dc_user_data() {
	$raw_cart = WC()->cart ? WC()->cart->get_cart() : [];
	$cart = [
		'items' => [],
		'count' => WC()->cart ? WC()->cart->get_cart_contents_count() : 0,
		'lineCount' => count( $raw_cart ),
		'url' => wc_get_cart_url(),
	];
	foreach ($raw_cart as $key => $cart_item) {
		$cartprod = $cart_item['data'];
		$imgs = ( $cartprod ? wp_get_attachment_image_src($cartprod->get_image_id(), 'thumbnail') : [] );
		$cart['items'][] = [
			'id'    => $cart_item['product_id'],
			'vid'   => $cart_item['variation_id'],
			'qty'   => $cart_item['quantity'],
			'name'  => $cartprod ? $cartprod->get_name() : '',
			'price' => $cartprod ? $cartprod->get_price(): '',
			'image' => $imgs ? $imgs[0] : '',
		];
	}

	wp_send_json_success( [
		'nonce'     => wp_create_nonce( get_user_nonce_name() ),
		'cart'      => $cart,
	] );
	die();
}

add_action('wp_ajax_dc_user_data', 'dc_user_data');
add_action('wp_ajax_nopriv_dc_user_data', 'dc_user_data');
