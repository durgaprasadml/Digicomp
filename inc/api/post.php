<?php
/**
 * REST API Endpoints for the Post Page.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates the single post payload.
 */
function dc_api_post_data( \WP_REST_Request $request, $type = 'post' ) {
	$slug = $request['slug'] ?? null;
	if ( ! $slug ) {
		return new \WP_Error( 'no_slug', 'No slug provided', [ 'status' => 400 ] );
	}

	$post = get_page_by_path( $slug, ARRAY_A, $type );
	if ( ! $post ) {
		return new \WP_Error( 'not_found', 'Page not found', [ 'status' => 404 ] );
	}
	$uid = (int) $post['post_author'];
	$author = get_user( $uid );
	$post['author'] = [
		'name'    => $author?->data?->display_name,
		'bio'     => get_the_author_meta( 'description', $uid ),
		'website' => get_the_author_meta( 'user_url', $uid ),
		'avatar'  => get_avatar_url( $uid ),
	];
	$post['date'] = get_the_date( '', $post );
	$post['readTime'] = read_time( $post['post_content'] );
	$post['html'] = apply_filters( 'the_content', $post['post_content'] );

	$post['head'] = dc_api_post_head( $request, $post );

	return rest_ensure_response( $post );
}

function dc_api_post_head( $request = null, $post = null ) {
	if ( $post ) {
		$title = $post['post_title'] . ' - Digicomp Technologies';
		$desc = wp_strip_all_tags( $post['post_excerpt'] );
		return [
			'title' => $title,
			'desc'  => $desc ?: 'Read ' . $post['post_title'] . ' at Digicomp Technologies.',
			'styles' => dc_post_blocks_styles( $post ),
		];
	}

	return [
		'title' => 'Digicomp Technologies - Page',
		'desc'  => 'Read page details at Digicomp Technologies.'
	];
}

function dc_api_page_data( \WP_REST_Request $request ) {
	return dc_api_post_data( $request, 'page' );
}

function dc_api_page_head( \WP_REST_Request $request ) {
	return dc_api_post_head( $request );
}

function dc_post_styles() {
	return ".dc-post {
  p { margin-bottom: 2rem; }
  blockquote { padding: 1rem; border-radius: var(--radius-2xl); background: var(--accent-soft); border-left: 4px solid var(--accent); margin-bottom: 2rem; }
  blockquote p { margin: 0; }
  pre { padding: 1rem; background: var(--surface); border-radius: var(--radius-2xl); border: 1px solid var(--border); }
}";
}

function dc_post_blocks_styles( $post ) {
	if ( ! has_blocks( $post['post_content'] ) ) {
		return [];
	}

	$parsed_blocks = parse_blocks( $post['post_content'] );
	$registry = WP_Block_Type_Registry::get_instance();

	// 2. Force WordPress to register frontend styles before grabbing the registry!
	if ( ! did_action( 'wp_enqueue_scripts' ) ) {
		do_action( 'wp_enqueue_scripts' );
	}

	$wp_styles = wp_styles();
	$urls = [];

	if (function_exists('wp_get_global_stylesheet')) {
		$urls['global-styles-inline'] = wp_get_global_stylesheet();
	}

	if ( isset( $wp_styles->registered['wp-block-library'] ) ) {
		$urls['wp-block-library-inline'] = $wp_styles->registered['wp-block-library']->extra['after'][0];
	}

	$urls['dc-post-inline'] = dc_post_styles();

	// Recursive helper to look through nested blocks (like columns or groups)
	$search_blocks = function ($blocks) use (&$search_blocks, $registry, $wp_styles, &$urls) {
		foreach ($blocks as $block) {
			if (empty($block['blockName'])) {
				continue;
			}

			$block_type = $registry->get_registered($block['blockName']);

			if ($block_type && ! empty($block_type->style_handles)) {
				foreach ($block_type->style_handles as $handle) {
					if (isset($wp_styles->registered[$handle]) && ! in_array($wp_styles->registered[$handle]->src, $urls) && false !== $wp_styles->registered[$handle]->src ) {
						$urls[$handle] = $wp_styles->registered[$handle]->src;
					}
				}
			}

			if (! empty($block['innerBlocks'])) {
				$search_blocks($block['innerBlocks']);
			}
		}
	};

	$search_blocks($parsed_blocks);

	return $urls;
}
