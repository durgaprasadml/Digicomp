<?php
/*
add_action('admin_enqueue_scripts', function($hook) {
	if ($hook === 'profile.php' || $hook === 'user-edit.php') {
		wp_enqueue_media();
	}
});
add_action('show_user_profile', 'cs_add_avatar_field');
add_action('edit_user_profile', 'cs_add_avatar_field');

function cs_add_avatar_field($user) {
	$avatar_id = get_user_meta($user->ID, 'user_avatar', true);
	$avatar_url = $avatar_id ? wp_get_attachment_image_url($avatar_id, 'thumbnail') : '';
	?>
	<h2>Profile Picture</h2>
	<table class="form-table">
		<tr>
			<th>Avatar</th>
			<td>
				<div id="custom-avatar-preview">
					<?php if ($avatar_url) : ?>
						<img src="<?php echo esc_url($avatar_url); ?>" width="96" style="display:block;margin-bottom:10px;">
					<?php endif; ?>
				</div>

				<input type="hidden" name="custom_avatar_id" id="custom_avatar_id" value="<?php echo esc_attr($avatar_id); ?>" />

				<button type="button" class="button" id="upload_custom_avatar">
					Select from Media Library
				</button>

				<button type="button" class="button" id="remove_custom_avatar">
					Remove
				</button>

				<p class="description">Choose image from Media Library.</p>
			</td>
		</tr>
	</table>

	<script>
	jQuery(document).ready(function($){

		var frame;

		$('#upload_custom_avatar').on('click', function(e){
			e.preventDefault();

			if (frame) {
				frame.open();
				return;
			}

			frame = wp.media({
				title: 'Select or Upload Avatar',
				button: { text: 'Use this image' },
				multiple: false
			});

			frame.on('select', function(){
				var attachment = frame.state().get('selection').first().toJSON();
				$('#custom_avatar_id').val(attachment.id);
				$('#custom-avatar-preview').html('<img src="'+attachment.sizes.thumbnail.url+'" width="96" style="display:block;margin-bottom:10px;">');
			});

			frame.open();
		});

		$('#remove_custom_avatar').on('click', function(){
			$('#custom_avatar_id').val('');
			$('#custom-avatar-preview').html('');
		});

	});
	</script>

	<?php
}
add_action('personal_options_update', 'cs_save_avatar');
add_action('edit_user_profile_update', 'cs_save_avatar');

function cs_save_avatar($user_id) {

	if (!current_user_can('upload_files')) {
		return;
	}

	if (isset($_POST['custom_avatar_id'])) {

		$new_avatar = intval($_POST['custom_avatar_id']);

		if ($new_avatar) {
			update_user_meta($user_id, 'custom_avatar_id', $new_avatar);
		} else {
			delete_user_meta($user_id, 'custom_avatar_id');
		}
	}
}
*/

add_filter('get_avatar_data', 'cs_replace_avatar_data', 10, 2);

function cs_replace_avatar_data($args, $id_or_email) {

	$user = false;

	if (is_numeric($id_or_email)) {
		$user = get_user_by('id', $id_or_email);
	} elseif (is_object($id_or_email) && !empty($id_or_email->user_id)) {
		$user = get_user_by('id', $id_or_email->user_id);
	} elseif (is_string($id_or_email)) {
		$user = get_user_by('email', $id_or_email);
	}

	if ($user) {

		$avatar_id = get_user_meta($user->ID, 'user_avatar', true);

		if ($avatar_id) {
			$size = isset($args['size']) ? $args['size'] : 96;
			$avatar_url = wp_get_attachment_image_url($avatar_id, array($size, $size));

			if ($avatar_url) {
				$args['url'] = $avatar_url;
			}
		}
	}

	return $args;
}

// Add social and contact fields to user profile
/* add_filter('user_contactmethods', 'skai_custom_contact_methods');
function skai_custom_contact_methods($methods) {
	$methods['designation'] = 'Designation';
	$methods['linkedin'] = 'LinkedIn username';
	$methods['github'] = 'Github username';
	$methods['instagram'] = 'Instagram username';
	$methods['twitter'] = 'X (Twitter)';
	$methods['public_mail'] = 'Public Mail';
	return $methods;
} */
