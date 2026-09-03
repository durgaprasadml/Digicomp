<?php
/**
 * REST API Endpoints for the Shop Page.
 */

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Generates the full product and filter payload for the Shop SPA.
 */
function dc_api_get_shop( \WP_REST_Request $request ) {
	$cat = $request['cat'] ?? null;
	$tag = $request['tag'] ?? null;
	$brand = $request['brand'] ?? null;
	$search = $request['s'] ?? $request['search'] ?? $request['q'] ?? null;
	$stock = $request['stock'] ?? $request['stock_status'] ?? null;
	$limit = isset( $request['limit'] ) ? intval( $request['limit'] ) : -1;

	$query_args = [
		'status' => 'publish',
		'limit'  => $limit > 0 ? $limit : -1,
	];

	if ( $cat ) {
		$query_args['category'] = array( $cat );
	} elseif ( $tag ) {
		$query_args['tag'] = array( $tag );
	} elseif ( $brand ) {
		$query_args['product_brand'] = array( $brand );
	}

	if ( ! empty( $search ) ) {
		$query_args['s'] = sanitize_text_field( $search );
	}

	if ( ! empty( $stock ) ) {
		$query_args['stock_status'] = sanitize_text_field( $stock );
	}

	// Fetch all products to build the filter dataset and virtualization payload
	$products_query = wc_get_products( $query_args );

	$products = [];
	$taxonomies = [
		'categories' => [],
		'tags'       => [],
		'brands'     => [],
		'attributes' => [],
		'acf'        => []
	];
	$acf_filter_keys = ['badges'];
	$min_price = PHP_INT_MAX;
	$max_price = 0;

	foreach ($products_query as $prod) {
		$img_id = $prod->get_image_id();
		$img_data = $img_id ? wp_get_attachment_image_src($img_id, 'medium') : [];

		$cats = wp_get_post_terms($prod->get_id(), 'product_cat', ['fields' => 'names']);
		$cats = is_wp_error($cats) ? [] : ($cats ?: []);

		$tags = wp_get_post_terms($prod->get_id(), 'product_tag', ['fields' => 'names']);
		$tags = is_wp_error($tags) ? [] : ($tags ?: []);

		$brands = wp_get_post_terms($prod->get_id(), 'product_brand', ['fields' => 'names']);
		$brands = is_wp_error($brands) ? [] : ($brands ?: []);

		$attrs = [];
		foreach ($prod->get_attributes() as $attr_name => $attr) {
			$label = wc_attribute_label($attr_name);
			if ($attr->is_taxonomy()) {
				$terms = wc_get_product_terms($prod->get_id(), $attr_name, ['fields' => 'names']);
				$attrs[$label] = is_wp_error($terms) ? [] : ($terms ?: []);
			} else {
				$options = $attr->get_options() ?: [];
				$attrs[$label] = is_array($options) ? $options : array_map('trim', explode('|', $options));
			}

			if (!isset($taxonomies['attributes'][$label])) {
				$taxonomies['attributes'][$label] = [];
			}
			foreach ($attrs[$label] as $val) {
				if (!in_array($val, $taxonomies['attributes'][$label])) {
					$taxonomies['attributes'][$label][] = $val;
				}
			}
		}

		// Extract badge if exists (for UI presentation)
		$badges = function_exists( 'get_field' ) ? get_field( 'badges', $prod->get_id() ) : [];
		$badge = dc_get_top_badge( $badges );

		// Extract generic ACF fields for filtering logic
		$acf_values = [];
		foreach ($acf_filter_keys as $key) {
			$val = function_exists('get_field') ? get_field($key, $prod->get_id()) : null;
			if (empty($val)) {
				$acf_values[$key] = [];
			} elseif (is_array($val)) {
				$acf_values[$key] = $val;
			} else {
				$acf_values[$key] = [$val === true ? 'Yes' : (string)$val];
			}

			if (!isset($taxonomies['acf'][$key])) {
				$taxonomies['acf'][$key] = [];
			}
			foreach ($acf_values[$key] as $v) {
				if (!in_array($v, $taxonomies['acf'][$key])) {
					$taxonomies['acf'][$key][] = $v;
				}
			}
		}

		$price = (float) ($prod->get_price() ?: 0);
		if ($price < $min_price) $min_price = $price;
		if ($price > $max_price) $max_price = $price;

		$min_price_req = isset( $request['min_price'] ) && is_numeric( $request['min_price'] ) ? floatval( $request['min_price'] ) : null;
		$max_price_req = isset( $request['max_price'] ) && is_numeric( $request['max_price'] ) ? floatval( $request['max_price'] ) : null;
		if ( $min_price_req !== null && $price < $min_price_req ) {
			continue;
		}
		if ( $max_price_req !== null && $price > $max_price_req ) {
			continue;
		}

		$products[] = [
			'id'          => $prod->get_id(),
			'name'        => $prod->get_name(),
			'slug'        => $prod->get_slug(),
			'sku'         => $prod->get_sku(),
			'excerpt'     => $prod->get_short_description(),
			'description' => $prod->get_description(),
			'price'       => $prod->get_price(),
			'regPrice'    => $prod->get_regular_price(),
			'salePrice'   => $prod->get_sale_price(),
			'stock'       => $prod->get_stock_status(),
			'stockQty'    => $prod->get_stock_quantity(),
			'image'       => $img_data ? $img_data[0] : '',
			'url'         => '/product/' . $prod->get_slug(),
			'permalink'   => get_permalink( $prod->get_id() ),
			'categories'  => $cats,
			'tags'        => $tags,
			'brands'      => $brands,
			'attributes'  => $attrs,
			'acf'         => $acf_values,
			'badge'       => $badge,
			'date'        => $prod->get_date_created() ? $prod->get_date_created()->getOffsetTimestamp() : 0,
		];

		$taxonomies['categories'] = array_unique(array_merge($taxonomies['categories'], $cats));
		$taxonomies['tags'] = array_unique(array_merge($taxonomies['tags'], $tags));
		$taxonomies['brands'] = array_unique(array_merge($taxonomies['brands'], $brands));
	}

	$taxonomies['categories'] = array_values($taxonomies['categories']);
	$taxonomies['tags'] = array_values($taxonomies['tags']);
	$taxonomies['brands'] = array_values($taxonomies['brands']);

	$heading = 'Shop';
	if ( $cat ) {
		$term = get_term_by( 'slug', $cat, 'product_cat' );
		if ( $term && ! is_wp_error( $term ) ) {
			$heading = 'Category: ' . $term->name;
		} else {
			$heading = 'Category: ' . ucwords( str_replace( '-', ' ', $cat ) );
		}
	} elseif ( $tag ) {
		$term = get_term_by( 'slug', $tag, 'product_tag' );
		if ( $term && ! is_wp_error( $term ) ) {
			$heading = 'Tag: ' . $term->name;
		} else {
			$heading = 'Tag: ' . ucwords( str_replace( '-', ' ', $tag ) );
		}
	} elseif ( $brand ) {
		$heading = 'Brand: ' . ucwords( str_replace( '-', ' ', $brand ) );
	}

	if ( defined( 'IS_DC_DEMO' ) ) {
		require_once get_stylesheet_directory() . '/inc/api/shop-mock.php';
		$mock_data = get_shop_mock_data( $products, $taxonomies );
		$mock_data['heading'] = $heading;
		if ( ! isset( $mock_data['head'] ) ) {
			$mock_data['head'] = ( $cat || $tag || $brand ) ? dc_api_taxonomy_head( $request ) : dc_api_shop_head();
		}
		return rest_ensure_response( $mock_data );
	}

	return rest_ensure_response([
		'heading'  => $heading,
		'products' => $products,
		'filters'  => $taxonomies,
		'priceMin' => $min_price,
		'priceMax' => $max_price,
		'head'     => ( $cat || $tag || $brand ) ? dc_api_taxonomy_head( $request ) : dc_api_shop_head(),
	]);
}

function dc_api_shop_head() {
	return [
		'title' => 'Digicomp Technologies - Shop all products',
		'desc'  => 'Browse all Digicomp Technologies products - Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.'
	];
}

function dc_api_taxonomy_head( $request = null ) {
	$cat = $request ? ($request['cat'] ?? null) : null;
	$tag = $request ? ($request['tag'] ?? null) : null;
	$brand = $request ? ($request['brand'] ?? null) : null;

	$title = 'Digicomp Technologies';
	$name = 'products';

	if ( $cat ) {
		$name = ucwords( str_replace( '-', ' ', $cat ) );
		$title = $name . ' - Digicomp Technologies';
	} elseif ( $tag ) {
		$name = ucwords( str_replace( '-', ' ', $tag ) );
		$title = $name . ' - Digicomp Technologies';
	} elseif ( $brand ) {
		$name = ucwords( str_replace( '-', ' ', $brand ) );
		$title = $name . ' - Digicomp Technologies';
	}

	return [
		'title' => $title,
		'desc'  => 'Browse ' . $name . ' at Digicomp Technologies.',
	];
}

/**
 * REST API Callback for Search Endpoint.
 */
function dc_api_get_search( \WP_REST_Request $request ) {
	return dc_api_get_shop( $request );
}
