<?php

function soon_admin_page() {
	?>
	<form method="POST" action="options.php">
	<?php
	settings_fields( 'soon' );
	do_settings_sections( 'soon' );
	submit_button();
	?>
	</form>
	<?php
}

function soon_admin_menu() {
	add_menu_page(
		'Coming Soon',
		'Coming Soon',
		'manage_options',
		'soon',
		'soon_admin_page',
		'dashicons-clock',
		3
	);
}
add_action( 'admin_menu', 'soon_admin_menu' );

function soon_settings_init() {
	add_settings_section(
		'soon_setting_section',
		'Coming Soon & Maintenance Settings',
		function() {},
		'soon'
	);

	add_settings_field(
		'cd_active',
		'Pre-launch Countdown Active',
		'soon_active_markup',
		'soon',
		'soon_setting_section'
	);

	add_settings_field(
		'lauch_time',
		'Launch time',
		'soon_lauch_time_markup',
		'soon',
		'soon_setting_section'
	);

	add_settings_field(
		'soon_show_admin',
		'Show to Admin',
		'soon_show_admin_markup',
		'soon',
		'soon_setting_section'
	);

	add_settings_field(
		'soon_maintenance',
		'Maintenance Mode',
		'soon_maintenance_markup',
		'soon',
		'soon_setting_section'
	);

	register_setting( 'soon', 'cd_active' );
	register_setting( 'soon', 'lauch_time' );
	register_setting( 'soon', 'soon_show_admin' );
	register_setting( 'soon', 'soon_maintenance' );
}

add_action( 'admin_init', 'soon_settings_init' );

function soon_active_markup() {
	?>
	<input type="checkbox" id="cd_active" name="cd_active" value="1" <?php checked( get_option( 'cd_active' ), 1, true ); ?>>
	<label for="cd_active">Is pre-launch countdown active?</label>
	<?php
}

function soon_lauch_time_markup() {
	?>
	<input type="datetime-local" id="lauch_time" name="lauch_time" value="<?php echo get_option( 'lauch_time' ); ?>">
	<?php
}

function soon_maintenance_markup() {
	?>
	<input type="checkbox" id="soon_maintenance" name="soon_maintenance" value="1" <?php checked( get_option( 'soon_maintenance' ), 1, true ); ?>>
	<label for="soon_maintenance">Enable maintenance mode (Blocks front-end)</label>
	<?php
}

function soon_show_admin_markup() {
	?>
	<input type="checkbox" id="soon_show_admin" name="soon_show_admin" value="1" <?php checked( get_option( 'soon_show_admin' ), 1, true ); ?>>
	<label for="soon_show_admin">Show countdown overlay to administrators</label>
	<?php
}
