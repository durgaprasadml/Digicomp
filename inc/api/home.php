<?php
/**
 * REST API Endpoints for the Home Page.
 */

if (!defined('ABSPATH')) {
	exit;
}

/**
 * Generates the full payload for the Home SPA.
 */
function dc_api_get_home( \WP_REST_Request $request ) {
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
			'excerpt'  => $featprod->get_short_description(),
			'price'    => $featprod->get_sale_price(),
			'regPrice' => $featprod->get_regular_price(),
			'stock'    => $featprod->get_stock_status(),
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
			$sticky[] = [
				'id'        => $stickyp->ID,
				'slug'      => $stickyp->post_name,
				'title'     => $stickyp->post_title,
				'excerpt'   => $stickyp->post_excerpt,
				'date'      => get_the_date( '', $stickyp->ID ),
				'img'       => $stickyimg,
				'permalink' => get_permalink( $stickyp->ID ),
				'tags'      => empty( $stckytags ) ? [] : array_map( fn($tag) => $tag->name, $stckytags),
				'readTime'  => read_time( $stickyp->post_content ),
			];
		}
	}

	return rest_ensure_response([
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
		'head'      => dc_api_home_head(),
	]);
}

function dc_api_home_head() {
	return dc_default_head();
}
