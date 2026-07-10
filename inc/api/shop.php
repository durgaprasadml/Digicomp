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
	// Fetch all products to build the filter dataset and virtualization payload
	$products_query = wc_get_products([
		'status' => 'publish',
		'limit'  => -1,
	]);

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

		// Try a few popular brand taxonomies
		$brands = [];
		if (taxonomy_exists('pwb-brand')) {
			$b = wp_get_post_terms($prod->get_id(), 'pwb-brand', ['fields' => 'names']);
			$brands = is_wp_error($b) ? [] : ($b ?: []);
		}
		if (empty($brands) && taxonomy_exists('product_brand')) {
			$b = wp_get_post_terms($prod->get_id(), 'product_brand', ['fields' => 'names']);
			$brands = is_wp_error($b) ? [] : ($b ?: []);
		} elseif (empty($brands) && taxonomy_exists('yith_product_brand')) {
			$b = wp_get_post_terms($prod->get_id(), 'yith_product_brand', ['fields' => 'names']);
			$brands = is_wp_error($b) ? [] : ($b ?: []);
		}

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
		$priority = ['Bestseller', 'Popular', 'Pro', 'New', 'Value'];
		$badge = is_array($badges) ? current( array_intersect( $priority, $badges ) ) : null;
		if (!$badge) $badge = null;

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

		$products[] = [
			'id'         => $prod->get_id(),
			'name'       => $prod->get_name(),
			'subtitle'   => $prod->get_short_description(),
			'price'      => $prod->get_price(),
			'regPrice'   => $prod->get_regular_price(),
			'image'      => $img_data ? $img_data[0] : '',
			'categories' => $cats,
			'tags'       => $tags,
			'brands'     => $brands,
			'attributes' => $attrs,
			'acf'        => $acf_values,
			'badge'      => $badge,
			'stock'      => $prod->get_stock_status(),
			'date'       => $prod->get_date_created() ? $prod->get_date_created()->getOffsetTimestamp() : 0,
		];

		$taxonomies['categories'] = array_unique(array_merge($taxonomies['categories'], $cats));
		$taxonomies['tags'] = array_unique(array_merge($taxonomies['tags'], $tags));
		$taxonomies['brands'] = array_unique(array_merge($taxonomies['brands'], $brands));
	}

	$taxonomies['categories'] = array_values($taxonomies['categories']);
	$taxonomies['tags'] = array_values($taxonomies['tags']);
	$taxonomies['brands'] = array_values($taxonomies['brands']);

	if ( defined( 'IS_DC_DEMO' ) ) {
		require_once get_stylesheet_directory() . '/inc/api/shop-mock.php';
		return rest_ensure_response( get_shop_mock_data( $products, $taxonomies ) );
	}

	return rest_ensure_response([
		'products' => $products,
		'filters'  => $taxonomies,
		'priceMin' => $min_price,
		'priceMax' => $max_price,
		'head'     => dc_api_shop_head(),
	]);
}

function dc_api_shop_head() {
	return [
		'title' => 'Digicomp Technologies - Shop all products',
		'desc'  => 'Browse all Digicomp Technologies products - Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.'
	];
}
