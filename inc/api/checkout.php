<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function dc_api_checkout_data( \WP_REST_Request $request ) {
	$cart_request = new \WP_REST_Request( 'GET', '/wc/store/v1/cart' );

	$nonce = $request->get_header( 'Nonce' );
	if ( $nonce ) {
		$cart_request->set_header( 'Nonce', $nonce );
	}

	$cart_response = rest_do_request( $cart_request );
	$cart_data = $cart_response->get_data();

	$checkout_request = new \WP_REST_Request( 'GET', '/wc/store/v1/checkout' );
	if ( $nonce ) {
		$checkout_request->set_header( 'Nonce', $nonce );
	}

	$checkout_response = rest_do_request( $checkout_request );
	$checkout_data = $checkout_response->is_error() ? [] : $checkout_response->get_data();

	// Merge shipping rates from cart if checkout doesn't have them
	if ( empty( $checkout_data['shipping_rates'] ) && ! empty( $cart_data['shipping_rates'] ) ) {
		$checkout_data['shipping_rates'] = $cart_data['shipping_rates'];
	}

	// Always ensure we have billing and shipping addresses even if empty in checkout payload
	if ( empty( $checkout_data['billing_address'] ) && ! empty( $cart_data['billing_address'] ) ) {
		$checkout_data['billing_address'] = $cart_data['billing_address'];
	}
	if ( empty( $checkout_data['shipping_address'] ) && ! empty( $cart_data['shipping_address'] ) ) {
		$checkout_data['shipping_address'] = $cart_data['shipping_address'];
	}

	// Add totals if missing
	if ( empty( $checkout_data['totals'] ) && ! empty( $cart_data['totals'] ) ) {
		$checkout_data['totals'] = $cart_data['totals'];
	}

	// Add payment methods
	$gateways = WC()->payment_gateways->get_available_payment_gateways();
	$payment_methods = [];
	foreach ( $gateways as $gateway ) {
		$payment_methods[] = [
			'id'          => $gateway->id,
			'title'       => $gateway->title,
			'description' => $gateway->description,
		];
	}
	$checkout_data['payment_methods'] = $payment_methods;

	return new \WP_REST_Response( [
		'head'     => dc_api_checkout_head(),
		'checkout' => $checkout_data
	] );
}

function dc_api_checkout_head() {
	return [
		'title' => 'Checkout - Digicomp Technologies',
		'desc'  => 'Complete your purchase securely.',
	];
}
