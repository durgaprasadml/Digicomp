<?php

function countdown_admin_page() {
	?>
	<form method="POST" action="options.php">
	<?php
	settings_fields( 'countdown' );
	do_settings_sections( 'countdown' );
	submit_button();
	?>
	</form>
	<?php
}

function cd_admin_menu() {
	add_menu_page(
		'Countdown',
		'Countdown',
		'manage_options',
		'countdown',
		'countdown_admin_page',
		'dashicons-clock',
		3
	);
}
add_action( 'admin_menu', 'cd_admin_menu' );

function cd_settings_init() {
	add_settings_section(
		'countdown_setting_section',
		'Countdown settings',
		function() {},
		'countdown'
	);

	add_settings_field(
		'cd_active',
		'Active',
		'cd_active_markup',
		'countdown',
		'countdown_setting_section'
	);

	add_settings_field(
		'lauch_time',
		'Launch time',
		'lauch_time_markup',
		'countdown',
		'countdown_setting_section'
	);

	register_setting( 'countdown', 'cd_active' );
	register_setting( 'countdown', 'lauch_time' );
}

add_action( 'admin_init', 'cd_settings_init' );

function cd_active_markup() {
	?>
	<input type="checkbox" id="cd_active" name="cd_active" value="1" <?php checked( get_option( 'cd_active' ), 1, true ); ?>>
	<label for="cd_active">Is countdown active?</label>
	<?php
}

function lauch_time_markup() {
	?>
	<input type="datetime-local" id="lauch_time" name="lauch_time" value="<?php echo get_option( 'lauch_time' ); ?>">
	<?php
}
