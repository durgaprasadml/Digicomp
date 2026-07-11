<?php
/**
 * REST API Endpoints for the Product Page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates the single product payload.
 */
function dc_api_get_product( \WP_REST_Request $request ) {
	return rest_ensure_response( [
	] );
}

function dc_api_product_head() {
	return [
		'title' => 'Digicomp Technologies - {Single Product}',
		'desc'  => 'Browse all Digicomp Technologies products - Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability.'
	];
}
