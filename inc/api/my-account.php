<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function dc_api_my_account_data( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	$tab     = $request['tab'] ?? 'dashboard';

	$data = [
		'tab'  => $tab,
		'user' => null,
	];

	if ( $user_id ) {
		$current_user = wp_get_current_user();
		$data['user'] = [
			'id'           => $user_id,
			'email'        => $current_user->user_email,
			'first_name'   => get_user_meta( $user_id, 'first_name', true ),
			'last_name'    => get_user_meta( $user_id, 'last_name', true ),
			'display_name' => $current_user->display_name,
			'username'     => $current_user->user_login,
		];

		switch ( $tab ) {
			case 'orders':
				$customer_orders = wc_get_orders( [
					'customer' => $user_id,
					'limit'    => 20,
					'status'   => array_diff( array_keys( wc_get_order_statuses() ), [ 'wc-checkout-draft', 'wc-trash' ] ),
				] );
				$orders = [];
				foreach ( $customer_orders as $order ) {
					$orders[] = [
						'id'           => $order->get_id(),
						'order_number' => $order->get_order_number(),
						'date'         => wc_format_datetime( $order->get_date_created() ),
						'status'       => wc_get_order_status_name( $order->get_status() ),
						'total'        => $order->get_formatted_order_total(),
						'item_count'   => $order->get_item_count(),
						'view_url'     => $order->get_view_order_url(),
					];
				}
				$data['orders'] = $orders;
				break;

			case 'downloads':
				$data['downloads'] = wc_get_customer_available_downloads( $user_id );
				break;

			case 'edit-address':
				$customer = new WC_Customer( $user_id );
				$data['billing_address'] = $customer->get_billing();
				$data['shipping_address'] = $customer->get_shipping();
				break;

			case 'view-order':
				$order_id = $request['id'] ?? 0;
				$order = wc_get_order( $order_id );
				if ( $order && $order->get_customer_id() === $user_id ) {
					$data['order'] = [
						'id'           => $order->get_id(),
						'order_number' => $order->get_order_number(),
						'date'         => wc_format_datetime( $order->get_date_created() ),
						'status'       => wc_get_order_status_name( $order->get_status() ),
						'total'        => $order->get_formatted_order_total(),
						'total_tax'    => $order->get_total_tax(),
						'payment_method'  => $order->get_payment_method(),
						'payment_title'   => $order->get_payment_method_title(),
						'transaction_id'   => $order->get_transaction_id(),
						'shipping_method'  => $order->get_shipping_method(),
						'billing_address'  => $order->get_formatted_billing_address(),
						'shipping_address' => $order->get_formatted_shipping_address(),
						'items'        => [],
					];
					foreach ( $order->get_items() as $item ) {
						$data['order']['items'][] = [
							'name'     => $item->get_name(),
							'quantity' => $item->get_quantity(),
							'total'    => wc_price( $item->get_total() ),
						];
					}
				}
				break;

			case 'edit-account':
			case 'dashboard':
			default:
				break;
		}
	}

	$response_data = array_merge( $data, [
		'head' => dc_api_my_account_head(),
	] );

	return new \WP_REST_Response( $response_data );
}

function dc_api_my_account_update( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Not logged in' ], 401 );
	}

	$params = $request->get_json_params() ?: $request->get_body_params();

	$update_data = [ 'ID' => $user_id ];

	if ( isset( $params['first_name'] ) ) {
		$update_data['first_name'] = sanitize_text_field( $params['first_name'] );
	}
	if ( isset( $params['last_name'] ) ) {
		$update_data['last_name'] = sanitize_text_field( $params['last_name'] );
	}
	if ( isset( $params['display_name'] ) ) {
		$update_data['display_name'] = sanitize_text_field( $params['display_name'] );
	}

	$user_id = wp_update_user( $update_data );

	if ( is_wp_error( $user_id ) ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => $user_id->get_error_message() ], 400 );
	}

	return new \WP_REST_Response( [ 'success' => true, 'message' => 'Account updated' ] );
}

function dc_api_my_account_head() {
	return [
		'title' => 'My Account - Digicomp Technologies',
		'desc'  => 'Manage your account, orders, and addresses.',
	];
}
