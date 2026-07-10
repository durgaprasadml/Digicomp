<?php

function get_home_data() {
	// 1. Hero
	$hero = get_page_by_path( 'esp32-s3', OBJECT, 'product' );
	$hero_url = '';
	if ( $hero ) {
		$hero_data = wp_get_attachment_image_src( ( wc_get_product( $hero->ID ) )->get_image_id(), 'full' );
		$hero_url  = $hero_data ? $hero_data[0] : '';
	}

	// 2. Featured Products
	$featured_products = wc_get_products(array(
		'featured' => true,
		'limit'    => 8,
		'status'   => 'publish',
	) );
	$featured = array();
	foreach ( $featured_products as $featprod ) {
		$featprod_id = $featprod->get_id();
		$badges = function_exists( 'get_field' ) ? get_field( 'badges', $featprod_id ) : [];
		$priority = ['Bestseller', 'Popular', 'Pro', 'New', 'Value'];
		$badge = current( array_intersect( $priority, $badges ) ) ?: null;
		$featimg_id  = $featprod->get_image_id();
		$featimg_url = '';
		if ($featimg_id) {
			$featimg_data = wp_get_attachment_image_src( $featimg_id, 'medium' );
			$featimg_url  = $featimg_data ? $featimg_data[0] : '';
		}
		$featured[] = array(
			'id'       => $featprod_id,
			'name'     => $featprod->get_name(),
			'subtitle' => $featprod->get_short_description(),
			'price'    => $featprod->get_sale_price(),
			'regPrice' => $featprod->get_regular_price(),
			'image'    => $featimg_url,
			'badge'    => $badge,
		);
	}

	// 3. Sticky Posts
	$sticky = [];
	$sticky_ids = get_option('sticky_posts');
	if ( !empty($sticky_ids) ) {
		rsort( $sticky_ids );
		$stickyquery = new WP_Query( [
			'post_type'           => 'post',
			'post__in'            => $sticky_ids,
			'posts_per_page'      => 3,
			'ignore_sticky_posts' => true
		] );
		$stickyposts = $stickyquery->posts;
		foreach ( $stickyposts as $stickyp ) {
			$stickyimg = has_post_thumbnail( $stickyp->ID ) ? get_the_post_thumbnail_url( $stickyp->ID, 'medium' ) : '';
			$stckytags = get_the_tags( $stickyp->ID );
			$word_count = str_word_count( strip_tags( $stickyp->post_content ) );
			$read_time  = ceil( $word_count / 200 );
			$sticky[] = [
				'id'        => $stickyp->ID,
				'title'     => $stickyp->post_title,
				'excerpt'   => $stickyp->post_excerpt,
				'date'      => get_the_date( '', $stickyp->ID ),
				'img'       => $stickyimg,
				'permalink' => get_permalink( $stickyp->ID ),
				'tags'      => empty( $stckytags ) ? [] : array_map( fn($tag) => $tag->name, $stckytags),
				'readTime'  => $read_time . ' min read',
			];
		}
	}

	return [
		'featured'  => $featured,
		'hero'      => [
			'img'   => $hero_url,
			'glb'   => '/wp-content/uploads/2026/07/ESP32-S3.glb',
		],
		'ecosystem' => [
			'mcus' => [
				'/wp-content/themes/dc/assets/img/products/ESP32-S3-front.png',
				'/wp-content/themes/dc/assets/img/products/RP2350-front.png',
				'/wp-content/themes/dc/assets/img/products/CH32V006-front.png'
			],
			'fpga' => '/wp-content/themes/dc/assets/img/products/FPGA-front.png'
		],
		'sticky'    => $sticky,
	];
}

function get_shop_data() {
	// Fetch all products to build the filter dataset
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

	if ($min_price === PHP_INT_MAX) $min_price = 0;

	if ( defined( 'IS_DC_DEMO' ) ) {
		require_once get_stylesheet_directory() . '/frontend/page-data-mock.php';
		return get_shop_mock_data( $products, $taxonomies );
	}

	return [
		'products' => $products,
		'filters'  => $taxonomies,
		'priceMin' => $min_price,
		'priceMax' => $max_price,
	];
}

function get_specific_data( $path = 'home', $ssr = false ) {
	if ( 'home' === $path ) {
		return [
			'ssd' => [ 'pages' => [ 'home' => $ssr ? get_home_data() : [] ] ],
		];
	} elseif ( 'shop' === $path ) {
		return [
			'title' => 'Digicomp Technologies - Shop all products',
			'ssd'   => [ 'pages' => [ 'shop' => $ssr ? get_shop_data() : [] ] ],
		];
	}
	return [];
}

function get_page_data( $path = 'home', $ssr = false ) {
	$data = [
		'title' => 'Digicomp Technologies — Engineered for Innovators',
		'desc'  => 'Digicomp Technologies — Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.',
		'theme' => 'dark',
		'color' => '#09090B',
		'kws'   => 'development boards, FPGA, BMS, ESP32, RP2040, Make in India, electronics, embedded systems',
		'ssd'   => [
			'homeUrl'   => get_home_url(),
			'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
			'searchUrl' => get_home_url() . '/wp-content/plugins/ajax-search-for-woocommerce-premium/includes/Engines/TNTSearchMySQL/Endpoints/search.php',
			'currency'  => html_entity_decode( get_woocommerce_currency_symbol() ),
			'pages'     => [],
		],
	];

	$specific = get_specific_data( $path, $ssr );
	if ( ! empty( $specific ) ) {
		foreach ( $specific as $key => $value ) {
			if ( 'ssd' === $key ) {
				if ( isset( $specific['ssd']['pages'] ) ) {
					$data['ssd']['pages'] = array_merge( $data['ssd']['pages'], $specific['ssd']['pages'] );
				}
			} else {
				$data[ $key ] = $value;
			}
		}
	}

	return $data;
}

function get_react_pages() {
	return ['home', 'shop'];
}

function get_user_nonce_name() {
	return 'dc_user_nonce';
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
			'img'   => $imgs ? $imgs[0] : '',
		];
	}

	wp_send_json_success( [
		'nonce'     => wp_create_nonce( get_user_nonce_name() ),
		'cart'      => $cart,
	] );
	die();
}

function dc_add_to_kart() {
	check_ajax_referer( get_user_nonce_name(), 'nonce' );
	if ( ! isset( $_POST['id'] ) ) {
		wp_send_json_error( array( 'message' => 'No product id provided' ), 400 );
	}
	$pid  = intval( $_POST['id'] );
	$qty  = intval( $_POST['qty'] || 1 );
	$key = WC()->cart->add_to_cart( $pid, $qty );
	wp_send_json_success( [
		'key' => $key,
		'id'  => $pid,
		'qty' => $qty,
	] );
	die();
}

function dc_page_data() {
	if ( ! isset( $_POST['path'] ) ) {
		wp_send_json_error( array( 'message' => 'No path provided' ), 400 );
	}
	try {
		$path = sanitize_text_field( $_POST['path'] );
		$data = get_specific_data( $path, true );
		wp_send_json_success( $data );
	} catch (Exception $e) {
		wp_send_json_error( ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500 );
	} catch (Error $e) {
		wp_send_json_error( ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500 );
	}
	die();
}

add_action('wp_ajax_add_to_cart', 'dc_add_to_kart');
add_action('wp_ajax_nopriv_add_to_cart', 'dc_add_to_kart');
add_action('wp_ajax_dc_user_data', 'dc_user_data');
add_action('wp_ajax_nopriv_dc_user_data', 'dc_user_data');
add_action('wp_ajax_dc_page_data', 'dc_page_data');
add_action('wp_ajax_nopriv_dc_page_data', 'dc_page_data');
