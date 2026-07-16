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
	$slug = $request['slug'] ?? null;
	if ( ! $slug ) {
		return new \WP_Error( 'no_slug', 'No slug provided', [ 'status' => 400 ] );
	}

	$product_obj = get_page_by_path( $slug, OBJECT, 'product' );
	if ( ! $product_obj ) {
		return new \WP_Error( 'not_found', 'Product not found', [ 'status' => 404 ] );
	}

	$product = wc_get_product( $product_obj->ID );
	if ( ! $product ) {
		return new \WP_Error( 'not_found', 'Product not found', [ 'status' => 404 ] );
	}

	$img_id = $product->get_image_id();
	$img_data = $img_id ? wp_get_attachment_image_src( $img_id, 'large' ) : [];

	// Gallery
	$gallery_ids = $product->get_gallery_image_ids();
	$gallery = [];
	if ( $img_id ) {
		$img_data = wp_get_attachment_image_src( $img_id, 'large' );
		$thumb_data = wp_get_attachment_image_src( $img_id, 'thumbnail' );
		$gallery[] = [
			'id'    => $img_id,
			'url'   => $img_data ? $img_data[0] : '',
			'thumb' => $thumb_data ? $thumb_data[0] : '',
		];
	}
	foreach ( $gallery_ids as $g_id ) {
		$g_data = wp_get_attachment_image_src( $g_id, 'large' );
		$t_data = wp_get_attachment_image_src( $g_id, 'thumbnail' );
		if ( $g_data ) {
			$gallery[] = [
				'id'    => $g_id,
				'url'   => $g_data[0],
				'thumb' => $t_data ? $t_data[0] : '',
			];
		}
	}

	$cats = wp_get_post_terms( $product->get_id(), 'product_cat', [ 'fields' => 'names' ] );
	$cats = is_wp_error( $cats ) ? [] : ( $cats ?: [] );

	$tags = wp_get_post_terms( $product->get_id(), 'product_tag', [ 'fields' => 'names' ] );
	$tags = is_wp_error( $tags ) ? [] : ( $tags ?: [] );

	$brands = wp_get_post_terms( $product->get_id(), 'product_brand', [ 'fields' => 'names' ] );
	$brands = is_wp_error( $brands ) ? [] : ( $brands ?: [] );

	$attrs = [];
	foreach ( $product->get_attributes() as $attr_name => $attr ) {
		$label = wc_attribute_label( $attr_name );
		if ( $attr->is_taxonomy() ) {
			$terms = wc_get_product_terms( $product->get_id(), $attr_name, [ 'fields' => 'names' ] );
			$attrs[ $label ] = is_wp_error( $terms ) ? [] : ( $terms ?: [] );
		} else {
			$options = $attr->get_options() ?: [];
			$attrs[ $label ] = is_array( $options ) ? $options : array_map( 'trim', explode( '|', $options ) );
		}
	}

	// ACF Fields
	$badge = null;
	$acf = [];
	if ( function_exists( 'get_field' ) ) {
		$datasheet = get_field( 'datasheet', $product->get_id() );
		$schematic = get_field( 'schematic', $product->get_id() );
		$designers_raw = get_field( 'designers', $product->get_id() );
		$badges = get_field( 'badges', $product->get_id() );

		// Helper from acf-product-fields.php
		$acf['badges'] = get_field( 'badges', $product->get_id() );
		$acf['datasheet'] = function_exists( 'sk_get_acf_file_info' ) ? sk_get_acf_file_info( $datasheet ) : null;
		$acf['schematic'] = function_exists( 'sk_get_acf_file_info' ) ? sk_get_acf_file_info( $schematic ) : null;

		$badge = dc_get_top_badge( $acf['badges'] );

		$designers = [];
		if ( ! empty( $designers_raw ) ) {
			foreach ( $designers_raw as $designer ) {
				$designer_id = 0;
				$name = '';
				$avatar = '';
				$bio = '';

				if ( is_array( $designer ) && isset( $designer['ID'] ) ) {
					$designer_id = $designer['ID'];
					$name = ! empty( $designer['display_name'] ) ? $designer['display_name'] : '';
					// $avatar = ! empty( $designer['user_avatar'] ) ? $designer['user_avatar'] : '';
					$bio = ! empty( $designer['user_description'] ) ? $designer['user_description'] : '';
				} elseif ( $designer instanceof WP_User ) {
					$designer_id = $designer->ID;
					$name = $designer->display_name;
					$bio = $designer->description;
				} elseif ( is_numeric( $designer ) ) {
					$designer_id = intval( $designer );
				}

				if ( $designer_id > 0 ) {
					if ( empty( $name ) || empty( $bio ) ) {
						$user_data = get_userdata( $designer_id );
						if ( $user_data ) {
							$name = empty( $name ) ? $user_data->display_name : $name;
							$bio = empty( $bio ) ? $user_data->description : $bio;
						}
					}
					$avatar = get_avatar_url( $designer_id );
					$designers[] = [
						'id'     => $designer_id,
						'name'   => $name,
						'avatar' => $avatar,
						'bio'    => $bio,
					];
				}
			}
		}
		$acf['designers'] = $designers;
	}

	// Related Products
	$related_ids = wc_get_related_products( $product->get_id(), 5 );
	$related_products = [];
	foreach ( $related_ids as $r_id ) {
		$r_prod = wc_get_product( $r_id );
		if ( $r_prod ) {
			$r_img_id = $r_prod->get_image_id();
			$r_img_data = $r_img_id ? wp_get_attachment_image_src( $r_img_id, 'medium' ) : [];
			$related_products[] = [
				'id'       => $r_prod->get_id(),
				'slug'     => $r_prod->get_slug(),
				'name'     => $r_prod->get_name(),
				'excerpt'  => $r_prod->get_short_description(),
				'price'    => $r_prod->get_price(),
				'regPrice' => $r_prod->get_regular_price(),
				'image'    => $r_img_data ? $r_img_data[0] : '',
				'stock'    => $product->get_stock_status(),
				'badge'    => null, // simplify for related
			];
		}
	}

	// Reviews
	$comments = get_comments( [
		'post_id' => $product->get_id(),
		'status'  => 'approve',
		'type'    => 'review',
	] );
	$reviews = [];
	foreach ( $comments as $comment ) {
		$rating = intval( get_comment_meta( $comment->comment_ID, 'rating', true ) );
		$reviews[] = [
			'id'      => $comment->comment_ID,
			'author'  => $comment->comment_author,
			'date'    => get_comment_date( 'c', $comment->comment_ID ),
			'content' => $comment->comment_content,
			'rating'  => $rating,
			'avatar'  => get_avatar_url( $comment->user_id ),
		];
	}

	$payload = [
		'id'          => $product->get_id(),
		'name'        => $product->get_name(),
		'slug'        => $product->get_slug(),
		'excerpt'     => $product->get_short_description(),
		'description' => $product->get_description(),
		'price'       => $product->get_price(),
		'regPrice'    => $product->get_regular_price(),
		'salePrice'   => $product->get_sale_price(),
		'sku'         => $product->get_sku(),
		'stock'       => $product->get_stock_status(),
		'stockQty'    => $product->get_stock_quantity(),
		'categories'  => $cats,
		'tags'        => $tags,
		'brands'      => $brands,
		'attributes'  => $attrs,
		'gallery'     => $gallery,
		'acf'         => $acf,
		'badge'       => $badge,
		'reviews'     => $reviews,
		'reviewCount' => $product->get_review_count(),
		'avgRating'   => $product->get_average_rating(),
		'related'     => $related_products,
		'head'        => dc_api_product_head( $request, $product ),
	];

	return rest_ensure_response( $payload );
}

function dc_api_product_head( $request = null, $product = null ) {
	if ( $product ) {
		$title = $product->get_name() . ' - Digicomp Technologies';
		$desc = wp_strip_all_tags( $product->get_short_description() );
		if ( empty( $desc ) ) {
			$desc = wp_trim_words( wp_strip_all_tags( $product->get_description() ), 20 );
		}
		return [
			'title' => $title,
			'desc'  => $desc ?: 'Buy ' . $product->get_name() . ' at Digicomp Technologies.',
		];
	}

	return [
		'title' => 'Digicomp Technologies - Product',
		'desc'  => 'View product details at Digicomp Technologies.'
	];
}
