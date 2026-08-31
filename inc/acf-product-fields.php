<?php
/**
 * ACF Custom Fields integration for WooCommerce Single Product pages.
 * Handles Designers custom tab and Files (Datasheet & Schematic) custom tab.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add custom product tabs for Designers and Files.
 */
function sk_add_custom_product_tabs( $tabs ) {
	global $post;
	if ( ! $post ) {
		return $tabs;
	}

	// 1. Designers Tab
	if ( function_exists( 'get_field' ) ) {
		$designers = get_field( 'designers', $post->ID );
		if ( ! empty( $designers ) ) {
			$tabs['designers'] = array(
				'title'    => __( 'Designers', 'woocommerce' ),
				'priority' => 26, // after files (25)
				'callback' => 'sk_designers_tab_content',
			);
		}
	}

	// 2. Files Tab (Datasheet & Schematic)
	if ( function_exists( 'get_field' ) ) {
		$datasheet = get_field( 'datasheet', $post->ID );
		$schematic = get_field( 'schematic', $post->ID );

		if ( ! empty( $datasheet ) || ! empty( $schematic ) ) {
			$tabs['files'] = array(
				'title'    => __( 'Files', 'woocommerce' ),
				'priority' => 25, // after specifications (20)
				'callback' => 'sk_files_tab_content',
			);
		}
	}

	// Sort tabs by priority to ensure correct stacked layout order.
	if ( ! empty( $tabs ) ) {
		uasort( $tabs, function( $a, $b ) {
			return $a['priority'] <=> $b['priority'];
		} );
	}

	return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'sk_add_custom_product_tabs', 99 );

/**
 * Render Designers custom tab content.
 */
function sk_designers_tab_content() {
	global $post;
	if ( ! $post ) {
		return;
	}

	if ( function_exists( 'get_field' ) ) {
		$designers = get_field( 'designers', $post->ID );
		if ( ! empty( $designers ) ) {
			echo '<div class="product-designers-list">';
			foreach ( $designers as $designer ) {
				$designer_id = 0;
				$name = '';
				$avatar = '';
				$bio = '';

				if ( is_array( $designer ) && isset( $designer['ID'] ) ) {
					// User Array format from ACF
					$designer_id = $designer['ID'];
					$name = ! empty( $designer['display_name'] ) ? $designer['display_name'] : '';
					$avatar = ! empty( $designer['user_avatar'] ) ? $designer['user_avatar'] : '';
					$bio = ! empty( $designer['user_description'] ) ? $designer['user_description'] : '';
				} elseif ( $designer instanceof WP_User ) {
					// WP_User object format
					$designer_id = $designer->ID;
					$name = $designer->display_name;
					$bio = $designer->description;
				} elseif ( is_numeric( $designer ) ) {
					// User ID format
					$designer_id = intval( $designer );
					$user_data = get_userdata( $designer_id );
					if ( $user_data ) {
						$name = $user_data->display_name;
						$bio = $user_data->description;
					}
				}

				if ( $designer_id > 0 ) {
					if ( empty( $name ) ) {
						$user_data = get_userdata( $designer_id );
						if ( $user_data ) {
							$name = $user_data->display_name;
						}
					}
					if ( empty( $avatar ) ) {
						$avatar = get_avatar( $designer_id, 96 );
					}
					if ( empty( $bio ) ) {
						$user_data = get_userdata( $designer_id );
						if ( $user_data ) {
							$bio = $user_data->description;
						}
					}

					echo '<div class="designer-card">';
					if ( ! empty( $avatar ) ) {
						echo '<div class="designer-avatar">' . $avatar . '</div>';
					}
					echo '<div class="designer-info">';
					echo '<h4 class="designer-name">' . esc_html( $name ) . '</h4>';
					if ( ! empty( $bio ) ) {
						echo '<p class="designer-bio">' . esc_html( $bio ) . '</p>';
					}
					echo '</div>'; // designer-info
					echo '</div>'; // designer-card
				}
			}
			echo '</div>'; // product-designers-list
		}
	}
}

/**
 * Helper to get file URL and mime type from ACF File field value.
 *
 * @param mixed $field_value ACF field value.
 * @return array|null Array with 'url' and 'mime' or null.
 */
function sk_get_acf_file_info( $field_value ) {
	if ( empty( $field_value ) ) {
		return null;
	}

	$url = '';
	$mime = '';

	if ( is_array( $field_value ) ) {
		// File Array format
		$url = $field_value['url'] ?? '';
		$mime = $field_value['mime_type'] ?? '';
	} elseif ( is_numeric( $field_value ) ) {
		// File ID format
		$url = wp_get_attachment_url( intval( $field_value ) );
		$mime = get_post_mime_type( intval( $field_value ) );
	} elseif ( is_string( $field_value ) ) {
		// File URL format
		$url = $field_value;
		// Determine mime type from extension as fallback
		$ext = pathinfo( wp_parse_url( $url, PHP_URL_PATH ), PATHINFO_EXTENSION );
		if ( 'pdf' === strtolower( $ext ) ) {
			$mime = 'application/pdf';
		} elseif ( in_array( strtolower( $ext ), array( 'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif' ), true ) ) {
			$mime = 'image/' . strtolower( $ext );
			if ( 'jpg' === $mime ) {
				$mime = 'image/jpeg';
			}
		}
	}

	if ( ! empty( $url ) ) {
		return array(
			'url'  => $url,
			'mime' => $mime,
		);
	}

	return null;
}

/**
 * Render Files custom tab content.
 */
function sk_files_tab_content() {
	global $post;
	if ( ! $post ) {
		return;
	}

	$datasheet_raw = function_exists( 'get_field' ) ? get_field( 'datasheet', $post->ID ) : null;
	$schematic_raw = function_exists( 'get_field' ) ? get_field( 'schematic', $post->ID ) : null;

	$datasheet_info = sk_get_acf_file_info( $datasheet_raw );
	$schematic_info = sk_get_acf_file_info( $schematic_raw );

	if ( ! $datasheet_info && ! $schematic_info ) {
		return;
	}

	echo '<div class="product-files-section">';

	if ( $datasheet_info ) {
		echo '<div class="file-block-card file-block-card--datasheet">';
		echo '<h3 class="file-block-title">' . esc_html__( 'Datasheet', 'dc' ) . '</h3>';
		echo '<div class="pdf-embed-wrapper">';
		echo '<iframe src="' . esc_url( $datasheet_info['url'] ) . '" width="100%" height="600" style="border: none; border-radius: 8px;" loading="lazy"></iframe>';
		echo '</div>';
		echo '</div>'; // file-block-card
	}

	if ( $schematic_info ) {
		echo '<div class="file-block-card file-block-card--schematic">';
		echo '<h3 class="file-block-title">' . esc_html__( 'Schematic', 'dc' ) . '</h3>';

		$is_pdf = ( 'application/pdf' === $schematic_info['mime'] );
		$is_image = ( 0 === strpos( $schematic_info['mime'], 'image/' ) );

		if ( $is_image ) {
			echo '<a class="image-embed-wrapper" href="' . esc_url( $schematic_info['url'] ) . '" target="_blank" rel="noopener">';
			echo '<img src="' . esc_url( $schematic_info['url'] ) . '" alt="' . esc_attr__( 'Schematic Diagram', 'dc' ) . '" loading="lazy" />';
			echo '</a>';
		} elseif ( $is_pdf ) {
			echo '<div class="pdf-embed-wrapper">';
			echo '<iframe src="' . esc_url( $schematic_info['url'] ) . '" width="100%" height="600" style="border: none; border-radius: 8px;" loading="lazy"></iframe>';
			echo '</div>';
		} else {
			// Fallback: If not PDF and not image, just link it
			echo '<div class="file-fallback-wrapper">';
			echo '<p>' . esc_html__( 'This schematic document is available for download.', 'dc' ) . '</p>';
			echo '<a href="' . esc_url( $schematic_info['url'] ) . '" class="button file-download-btn" target="_blank" rel="noopener">' . esc_html__( 'Download Schematic File', 'dc' ) . '</a>';
			echo '</div>';
		}
		echo '</div>'; // file-block-card
	}

	echo '</div>'; // product-files-section
}
