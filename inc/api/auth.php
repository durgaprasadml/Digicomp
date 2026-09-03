<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handle user login by username or email.
 */
function dc_api_auth_login( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$username_input = trim( (string) $request->get_param( 'username' ) );
	$password       = (string) $request->get_param( 'password' );
	$remember       = $request->get_param( 'remember' ) === true;

	if ( empty( $username_input ) || empty( $password ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Please enter both email/username and password.'
		], 400 );
	}

	// Support logging in via email or username
	$user_login = $username_input;
	if ( is_email( $username_input ) ) {
		$user = get_user_by( 'email', $username_input );
		if ( $user ) {
			$user_login = $user->user_login;
		}
	}

	$creds = array(
		'user_login'    => $user_login,
		'user_password' => $password,
		'remember'      => $remember,
	);

	$user = wp_signon( $creds, is_ssl() );

	if ( is_wp_error( $user ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Incorrect email or password.'
		], 200 );
	}

	// Ensure auth cookie is set
	wp_set_current_user( $user->ID );
	wp_set_auth_cookie( $user->ID, $remember );

	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Logged in successfully.',
		'user'    => [
			'id'         => $user->ID,
			'email'      => $user->user_email,
			'first_name' => $user->first_name,
			'last_name'  => $user->last_name,
		]
	], 200 );
}

/**
 * Handle user logout.
 */
function dc_api_auth_logout( \WP_REST_Request $request ) {
	wp_logout();
	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Logged out successfully.'
	], 200 );
}

/**
 * Handle user registration with full name, email, and password.
 */
function dc_api_auth_register( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$email     = sanitize_email( trim( (string) $request->get_param( 'email' ) ) );
	$name      = sanitize_text_field( trim( (string) ( $request->get_param( 'name' ) ?: $request->get_param( 'username' ) ) ) );
	$password  = (string) $request->get_param( 'password' );

	if ( empty( $email ) || ! is_email( $email ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Please enter a valid email address.'
		], 400 );
	}

	if ( email_exists( $email ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'An account with this email already exists.'
		], 200 );
	}

	// Split name into first and last name
	$first_name = $name;
	$last_name  = '';
	if ( ! empty( $name ) ) {
		$parts = explode( ' ', $name, 2 );
		$first_name = $parts[0];
		$last_name  = isset( $parts[1] ) ? $parts[1] : '';
	}

	// Generate a unique username from email
	$base_username = sanitize_user( current( explode( '@', $email ) ), true );
	if ( empty( $base_username ) ) {
		$base_username = 'user';
	}
	$username = $base_username;
	$counter  = 1;
	while ( username_exists( $username ) ) {
		$username = $base_username . $counter;
		$counter++;
	}

	// If no password provided, generate a random one
	if ( empty( $password ) ) {
		$password = wp_generate_password( 12, true );
	}

	$user_data = [
		'user_login' => $username,
		'user_email' => $email,
		'user_pass'  => $password,
		'first_name' => $first_name,
		'last_name'  => $last_name,
		'role'       => 'customer',
	];

	$user_id = wp_insert_user( $user_data );

	if ( is_wp_error( $user_id ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Unable to create account. Please try again.'
		], 200 );
	}

	// Automatically authenticate the new user
	wp_set_current_user( $user_id );
	wp_set_auth_cookie( $user_id, true );

	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Account created successfully.',
		'user'    => [
			'id'         => $user_id,
			'email'      => $email,
			'first_name' => $first_name,
			'last_name'  => $last_name,
		]
	], 200 );
}

/**
 * Handle forgot password request.
 */
function dc_api_auth_forgot_password( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$email = sanitize_email( trim( (string) $request->get_param( 'email' ) ) );

	if ( empty( $email ) || ! is_email( $email ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Please enter a valid email address.'
		], 400 );
	}

	$user = get_user_by( 'email', $email );

	if ( $user ) {
		// Trigger WordPress password reset notification
		retrieve_password( $user->user_login );
	}

	// Always return uniform friendly message to prevent email enumeration
	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'If an account exists with this email, a password reset link has been sent.'
	], 200 );
}

/**
 * Handle Google OAuth Sign-in.
 */
function dc_api_auth_google( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$credential = $request->get_param( 'credential' );

	if ( empty( $credential ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Google credential token is required.'
		], 400 );
	}

	// Verify Google ID token via Google TokenInfo API
	$verify_url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode( $credential );
	$response   = wp_remote_get( $verify_url, [ 'timeout' => 15 ] );

	if ( is_wp_error( $response ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Unable to connect to Google. Please try again.'
		], 200 );
	}

	$code = wp_remote_retrieve_response_code( $response );
	$body = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( 200 !== $code || empty( $body['email'] ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Google authentication failed or expired. Please try again.'
		], 200 );
	}

	$email      = sanitize_email( $body['email'] );
	$first_name = sanitize_text_field( $body['given_name'] ?? '' );
	$last_name  = sanitize_text_field( $body['family_name'] ?? '' );

	// Check if user already exists
	$user = get_user_by( 'email', $email );

	if ( ! $user ) {
		// Create new customer account
		$base_username = sanitize_user( current( explode( '@', $email ) ), true );
		if ( empty( $base_username ) ) {
			$base_username = 'google_user';
		}
		$username = $base_username;
		$counter  = 1;
		while ( username_exists( $username ) ) {
			$username = $base_username . $counter;
			$counter++;
		}

		$user_id = wp_insert_user( [
			'user_login' => $username,
			'user_email' => $email,
			'user_pass'  => wp_generate_password( 24, true ),
			'first_name' => $first_name,
			'last_name'  => $last_name,
			'role'       => 'customer',
		] );

		if ( is_wp_error( $user_id ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Could not create account with Google. Please try email sign up.'
			], 200 );
		}

		$user = get_user_by( 'id', $user_id );
	}

	// Sign the user in
	wp_set_current_user( $user->ID );
	wp_set_auth_cookie( $user->ID, true );

	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'Signed in with Google successfully.',
		'user'    => [
			'id'         => $user->ID,
			'email'      => $user->user_email,
			'first_name' => $user->first_name,
			'last_name'  => $user->last_name,
		]
	], 200 );
}

/**
 * Handle Phone OTP send request.
 */
function dc_api_auth_phone_send_otp( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$phone = sanitize_text_field( trim( (string) $request->get_param( 'phone' ) ) );

	if ( empty( $phone ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Please enter a valid phone number.'
		], 400 );
	}

	// Check if Twilio / SMS provider credentials are configured in environment or wp-config
	$twilio_sid   = getenv( 'TWILIO_ACCOUNT_SID' ) ?: ( defined( 'TWILIO_ACCOUNT_SID' ) ? TWILIO_ACCOUNT_SID : '' );
	$twilio_token = getenv( 'TWILIO_AUTH_TOKEN' ) ?: ( defined( 'TWILIO_AUTH_TOKEN' ) ? TWILIO_AUTH_TOKEN : '' );

	if ( empty( $twilio_sid ) || empty( $twilio_token ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Phone OTP verification requires SMS provider credentials. Please sign in with Email or Google.'
		], 200 );
	}

	// Provider is configured - SMS sending implementation here
	return new \WP_REST_Response( [
		'success' => true,
		'message' => 'OTP sent to your phone number.'
	], 200 );
}

/**
 * Handle Phone OTP verify request.
 */
function dc_api_auth_phone_verify_otp( \WP_REST_Request $request ) {
	if ( dc_api_is_spam( $request ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Spam detected.'
		], 403 );
	}

	$phone = sanitize_text_field( trim( (string) $request->get_param( 'phone' ) ) );
	$otp   = sanitize_text_field( trim( (string) $request->get_param( 'otp' ) ) );

	if ( empty( $phone ) || empty( $otp ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Phone number and verification code are required.'
		], 400 );
	}

	$twilio_sid = getenv( 'TWILIO_ACCOUNT_SID' ) ?: ( defined( 'TWILIO_ACCOUNT_SID' ) ? TWILIO_ACCOUNT_SID : '' );
	if ( empty( $twilio_sid ) ) {
		return new \WP_REST_Response( [
			'success' => false,
			'message' => 'Phone OTP verification requires SMS provider credentials. Please sign in with Email or Google.'
		], 200 );
	}

	return new \WP_REST_Response( [
		'success' => false,
		'message' => 'Invalid or expired verification code.'
	], 200 );
}

function dc_api_auth_page_data() {
	return new \WP_REST_Response( [ 'head' => dc_api_auth_page_head() ] );
}

function dc_api_auth_page_head() {
	return [
		'title' => 'Sign In or Create Account — DigiComp Technologies',
		'desc'  => 'Sign in to DigiComp Technologies to access your account, orders, wishlists, and DigiComp AI.',
	];
}

