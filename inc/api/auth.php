<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function dc_api_auth_login( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$creds = array(
		'user_login'    => sanitize_user( $request->get_param( 'username' ) ),
		'user_password' => $request->get_param( 'password' ),
		'remember'      => $request->get_param( 'remember' ) === true,
	);

	$user = wp_signon( $creds, is_ssl() ? 'true' : 'false' );

	if ( is_wp_error( $user ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => $user->get_error_message()
		], 200 );
	}

	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Logged in successfully.'
	], 200 );
}

function dc_api_auth_logout( \WP_REST_Request $request ) {
	wp_logout();
	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Logged out successfully.'
	], 200 );
}

function dc_api_auth_register( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$username = sanitize_user( $request->get_param( 'username' ) );
	$email    = sanitize_email( $request->get_param( 'email' ) );

	if ( empty( $username ) || empty( $email ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Username and email are required.'
		], 400 );
	}

	$user_id = register_new_user( $username, $email );

	if ( is_wp_error( $user_id ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => $user_id->get_error_message()
		], 400 );
	}

	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Registration successful. Please check your email for the password.'
	], 200 );
}

function dc_api_auth_page_data() {
	return new \WP_REST_Response( [ 'head' => dc_api_auth_page_head() ] );
}

function dc_api_auth_page_head() {
	return [
		'title' => 'Authentication - Digicomp Technologies',
		'desc'  => 'Log in or create an account to manage your orders, wishlists, and settings.',
	];
}
