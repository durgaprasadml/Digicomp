<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'skai/v1', '/deploy-theme', array(
		'methods'             => 'POST',
		'callback'            => 'skai_deploy_theme_callback',
		'permission_callback' => 'skai_deploy_theme_permission_check',
	) );
} );

function skai_deploy_theme_permission_check( WP_REST_Request $request ) {
	$token = $request->get_header( 'X-GitHub-Token' );
	if ( empty( $token ) ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Missing token.', 'skai' ), array( 'status' => 401 ) );
	}

	$secret = defined( 'GITHUB_DEPLOY_SECRET' ) ? GITHUB_DEPLOY_SECRET : ( get_option( 'github_deploy_secret' ) ?: '' );
	if ( empty( $secret ) || ! hash_equals( $secret, $token ) ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Invalid token.', 'skai' ), array( 'status' => 401 ) );
	}

	return true;
}

function skai_deploy_theme_callback( WP_REST_Request $request ) {
	$files = $request->get_file_params();

	if ( empty( $files['theme_zip'] ) || $files['theme_zip']['error'] !== UPLOAD_ERR_OK ) {
		return new WP_Error( 'upload_error', esc_html__( 'Missing or invalid zip file.', 'skai' ), array( 'status' => 400 ) );
	}

	$zip_file = $files['theme_zip']['tmp_name'];

	require_once ABSPATH . 'wp-admin/includes/file.php';
	WP_Filesystem();
	global $wp_filesystem;

	$theme_dir = get_theme_root() . '/dc';
	$backup_dir = get_theme_root() . '/dc-backup-' . time();

	$moved = false;
	if ( $wp_filesystem && $wp_filesystem->method === 'direct' && $wp_filesystem->is_dir( $theme_dir ) ) {
		$moved = $wp_filesystem->move( $theme_dir, $backup_dir );
	}

	if ( $moved ) {
		$wp_filesystem->mkdir( $theme_dir );
	}

	$unzip_result = unzip_file( $zip_file, $theme_dir );

	if ( is_wp_error( $unzip_result ) ) {
		if ( $moved ) {
			// Try to restore
			$wp_filesystem->delete( $theme_dir, true );
			$wp_filesystem->move( $backup_dir, $theme_dir );
		}
		return new WP_Error( 'unzip_error', $unzip_result->get_error_message(), array( 'status' => 500 ) );
	}

	if ( $moved ) {
		$wp_filesystem->delete( $backup_dir, true );
	}

	return rest_ensure_response( array(
		'success' => true,
		'message' => 'Theme updated successfully.',
	) );
}
