<?php

if (! defined('ABSPATH')) {
	exit;
}

function dc_install_wishlist_tables() {
	global $wpdb;

	$version = '1.0.0';
	$installed_version = get_option('dc_wishlist_db_version');

	if ($installed_version !== $version) {
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$wishlist_table = $wpdb->prefix . 'dc_wishlists';

		$sql = "CREATE TABLE $wishlist_table (
			id varchar(36) NOT NULL,
			user_id bigint(20) NOT NULL,
			name varchar(255) NOT NULL,
			items LONGTEXT NOT NULL,
			created_at datetime DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY user_id (user_id)
		) $charset_collate;";

		dbDelta($sql);

		update_option('dc_wishlist_db_version', $version);
	}
}

add_action( 'admin_init', 'dc_install_wishlist_tables' );
