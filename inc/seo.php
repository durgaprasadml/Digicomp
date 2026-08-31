<?php

if (! defined('ABSPATH')) {
	exit;
}

/**
 * Inject virtual routes into the Rank Math Page Sitemap.
 * Because these routes are handled by our React app (and we manually return a 200 status),
 * we need to explicitly tell Rank Math to include them in the sitemap.
 *
 * When new routes are added, click "Save Changes" on RankMath > Sitemap Settings to clear the cache.
 * Dev env alternative: add_filter( 'rank_math/sitemap/enable_caching', '__return_false' );
 */
add_filter( 'rank_math/sitemap/page_content', function( $content ) {
    $virtual_pages = [ '/login', '/signup' ];
    $last_mod = date( 'c' );

    foreach ( $virtual_pages as $path ) {
        $content .= sprintf(
            '<url>
                <loc>%s</loc>
                <lastmod>%s</lastmod>
            </url>',
            esc_url( home_url( $path ) ),
            $last_mod
        );
    }

    return $content;
} );
