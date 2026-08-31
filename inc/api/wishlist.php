<?php
if (! defined('ABSPATH')) {
	exit;
}

function dc_api_wishlist_data( \WP_REST_Request $request ) {
	global $wpdb;
	
	$wishlist_id = $request['id'] ?? null;
	$user_id = get_current_user_id();
	
	$wishlist_table = $wpdb->prefix . 'dc_wishlists';

	if ( $wishlist_id ) {
		// View single wishlist
		$wishlist = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $wishlist_table WHERE id = %s", $wishlist_id ) );
		if ( ! $wishlist ) {
			return new \WP_Error( 'not_found', 'Wishlist not found', [ 'status' => 404 ] );
		}

		$item_ids = json_decode( $wishlist->items, true ) ?: [];
		$products = [];
		foreach ( $item_ids as $product_id ) {
			$product = wc_get_product( $product_id );
			if ( $product ) {
				$img_id = $product->get_image_id();
				$img_data = $img_id ? wp_get_attachment_image_src($img_id, 'medium') : [];
				$badges = function_exists( 'get_field' ) ? get_field( 'badges', $product->get_id() ) : [];
				$badge = dc_get_top_badge( $badges );

				$products[] = [
					'id'       => $product->get_id(),
					'name'     => $product->get_name(),
					'excerpt'  => $product->get_short_description(),
					'price'    => $product->get_price(),
					'regPrice' => $product->get_regular_price(),
					'stock'    => $product->get_stock_status(),
					'image'    => $img_data ? $img_data[0] : '',
					'slug'     => $product->get_slug(),
					'url'      => str_replace(get_home_url(), '', $product->get_permalink()),
					'badge'    => $badge,
					'added_at' => $wishlist->created_at
				];
			}
		}
		
		return new \WP_REST_Response( [
			'wishlist' => $wishlist,
			'products' => $products,
			'head' => [
				'title' => $wishlist->name . ' - Digicomp',
				'desc' => 'View this wishlist.'
			]
		] );
	} else {
		if ( ! $user_id ) {
			return new \WP_Error( 'not_logged_in', 'Not logged in', [ 'status' => 401 ] );
		}

		// List wishlists
		$wishlists = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $wishlist_table WHERE user_id = %d ORDER BY created_at DESC", $user_id ) );
		
		// Get item counts
		foreach ($wishlists as &$wl) {
			$item_ids = json_decode( $wl->items, true ) ?: [];
			$wl->item_count = count( $item_ids );
		}

		return new \WP_REST_Response( [
			'wishlists' => $wishlists,
			'head' => [
				'title' => 'My Wishlists - Digicomp',
				'desc' => 'Manage your wishlists.'
			]
		] );
	}
}

function dc_api_wishlist_create( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Not logged in' ], 401 );
	}

	global $wpdb;
	$wishlist_table = $wpdb->prefix . 'dc_wishlists';

	$count = $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $wishlist_table WHERE user_id = %d", $user_id ) );
	if ( $count >= 10 ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Maximum of 10 wishlists allowed.' ], 400 );
	}

	$name = sanitize_text_field( $request->get_param( 'name' ) );
	if ( empty( $name ) ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Name is required.' ], 400 );
	}

	$id = substr( wp_generate_uuid4(), 0, 8 );

	$wpdb->insert( $wishlist_table, [
		'id' => $id,
		'user_id' => $user_id,
		'name' => $name,
		'items' => '[]',
	] );

	return new \WP_REST_Response( [ 'success' => true, 'id' => $id, 'name' => $name ] );
}

function dc_api_wishlist_delete( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Not logged in' ], 401 );
	}

	global $wpdb;
	$wishlist_table = $wpdb->prefix . 'dc_wishlists';

	$id = sanitize_text_field( $request->get_param( 'id' ) );
	
	// Ensure user owns this wishlist
	$wishlist = $wpdb->get_row( $wpdb->prepare( "SELECT user_id FROM $wishlist_table WHERE id = %s", $id ) );
	if ( ! $wishlist || (int) $wishlist->user_id !== $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Unauthorized' ], 403 );
	}

	$wpdb->delete( $wishlist_table, [ 'id' => $id ] );

	return new \WP_REST_Response( [ 'success' => true ] );
}

function dc_api_wishlist_add_item( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Not logged in' ], 401 );
	}

	global $wpdb;
	$wishlist_table = $wpdb->prefix . 'dc_wishlists';

	$wishlist_id = sanitize_text_field( $request->get_param( 'id' ) );
	$product_id = (int) $request->get_param( 'product_id' );

	$wishlist = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, items FROM $wishlist_table WHERE id = %s", $wishlist_id ) );
	if ( ! $wishlist || (int) $wishlist->user_id !== $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Unauthorized' ], 403 );
	}

	$item_ids = json_decode( $wishlist->items, true ) ?: [];
	if ( ! in_array( $product_id, $item_ids ) ) {
		$item_ids[] = $product_id;
		$wpdb->update( 
			$wishlist_table, 
			[ 'items' => wp_json_encode( $item_ids ) ], 
			[ 'id' => $wishlist_id ] 
		);
	}

	return new \WP_REST_Response( [ 'success' => true ] );
}

function dc_api_wishlist_remove_item( \WP_REST_Request $request ) {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Not logged in' ], 401 );
	}

	global $wpdb;
	$wishlist_table = $wpdb->prefix . 'dc_wishlists';

	$wishlist_id = sanitize_text_field( $request->get_param( 'id' ) );
	$product_id = (int) $request->get_param( 'product_id' );

	$wishlist = $wpdb->get_row( $wpdb->prepare( "SELECT user_id, items FROM $wishlist_table WHERE id = %s", $wishlist_id ) );
	if ( ! $wishlist || (int) $wishlist->user_id !== $user_id ) {
		return new \WP_REST_Response( [ 'success' => false, 'message' => 'Unauthorized' ], 403 );
	}

	$item_ids = json_decode( $wishlist->items, true ) ?: [];
	$index = array_search( $product_id, $item_ids );
	if ( $index !== false ) {
		array_splice( $item_ids, $index, 1 );
		$wpdb->update( 
			$wishlist_table, 
			[ 'items' => wp_json_encode( $item_ids ) ], 
			[ 'id' => $wishlist_id ] 
		);
	}

	return new \WP_REST_Response( [ 'success' => true ] );
}
