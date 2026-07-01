<?php

$manifest = get_stylesheet_directory() . '/frontend/home/dist/_manifest.json';
$mdata = wp_json_file_decode($manifest, array('associative' => true));
$js = $mdata['src/main.jsx']['file'];
$csss = $mdata['src/main.jsx']['css'];
$home_dist = GREENLET_CHILD_URL . '/frontend/home/dist/';

// Fetch featured products
$featured_products = wc_get_products(array(
	'featured' => true,
	'limit'    => 8,
	'status'   => 'publish',
) );

$featured = array();
foreach ( $featured_products as $product ) {
	$product_id = $product->get_id();
	$badges = function_exists( 'get_field' ) ? get_field( 'badges', $product_id ) : [];
	$priority = ['Bestseller', 'Popular', 'Pro', 'New', 'Value'];
	$badge = current( array_intersect( $priority, $badges ) ) ?: null;
	$image_id  = $product->get_image_id();
	$image_url = '';
	if ($image_id) {
		$image_data = wp_get_attachment_image_src( $image_id, 'medium' );
		$image_url  = $image_data ? $image_data[0] : '';
	}

	$featured[] = array(
		'id'       => $product_id,
		'name'     => $product->get_name(),
		'subtitle' => $product->get_short_description(),
		'price'    => $product->get_sale_price(),
		'regPrice' => $product->get_regular_price(),
		'image'    => $image_url,
		'badge'    => $badge,
	);
}

$product_post = get_page_by_path( 'esp32-s3', OBJECT, 'product' );
$hero_img = '';
if ( $product_post ) {
	$hero_data = wp_get_attachment_image_src( ( wc_get_product( $product_post->ID ) )->get_image_id(), 'full' );
	$image_url  = $hero_data ? $hero_data[0] : '';
}

$args = array(
	'numberposts' => 3,
	'orderby'     => 'date',
	'order'       => 'DESC',
	'post_type'   => 'post',
	'post_status' => 'publish'
);

// 2. Fetch the posts
$posts = [];
$sticky_ids = get_option('sticky_posts');
rsort( $sticky_ids );
$query = new WP_Query( [
	'post_type'           => 'post',
	'post__in'            => $sticky_ids,
	'posts_per_page'      => 3,
	'ignore_sticky_posts' => true
] );
$raw_posts = $query->posts;
foreach ( $raw_posts as $post ) {
	$img = has_post_thumbnail( $post->ID ) ? get_the_post_thumbnail_url( $post->ID, 'medium' ) : '';
	$tags = get_the_tags( $post->ID );
	$word_count = str_word_count( strip_tags( $post->post_content ) );
	$read_time  = ceil( $word_count / 200 );
	$posts[] = [
		'id'        => $post->ID,
		'title'     => $post->post_title,
		'excerpt'   => $post->post_excerpt,
		'date'      => get_the_date( '', $post->ID ),
		'img'       => $img,
		'permalink' => get_permalink( $post->ID ),
		'tags'      => empty( $tags ) ? [] : array_map( fn($tag) => $tag->name, $tags),
		'readTime'  => $read_time . ' min read',
	];
}

$ssd = [
	'cartCount' => WC()->cart->get_cart_contents_count(),
	'currency'  => html_entity_decode( get_woocommerce_currency_symbol() ),
	'featured'  => $featured,
	'hero'      => [
		'img'   => $image_url,
		'3d'    => '',
	],
	'ecosystem' => [
		'mcus' => [
			'/wp-content/themes/dc/assets/img/products/ESP32-S3-front.png',
			'/wp-content/themes/dc/assets/img/products/RP2350-front.png',
			'/wp-content/themes/dc/assets/img/products/CH32V006-front.png'
		],
		'fpga' => '/wp-content/themes/dc/assets/img/products/FPGA-front.png'
	],
	'posts' => $posts,
];
$ssj = wp_json_encode( $ssd );
?>

<!doctype html>
<html lang="en" data-theme="dark">
<head>
	<meta charset="UTF-8" />
	<link rel="icon" type="image/svg+xml" href="/wp-content/themes/dc/assets/img/logo.svg" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Digicomp Technologies — Research-grade development boards, BMS, and FPGA modules designed and manufactured in India. Open-source documentation, industrial reliability." />
	<meta name="keywords" content="development boards, FPGA, BMS, ESP32, RP2040, Make in India, electronics, embedded systems" />
	<meta name="theme-color" content="#09090B" />
	<title>Digicomp Technologies — Engineered for Innovators</title>
	<?php
	foreach ( $csss as $css ) {
		echo '<link rel="stylesheet" href="' . $home_dist . $css . '">';
	}
	?>
</head>
<body>
	<div id="dc-home"></div>
	<script><?php echo 'var dcSSD = ' . $ssj; ?></script>
	<script src="<?php echo $home_dist . $js ?>"></script>
</body>
</html>
