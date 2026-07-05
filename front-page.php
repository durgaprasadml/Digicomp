<?php

$manifest = get_stylesheet_directory() . '/frontend/home/dist/_manifest.json';
$mdata = wp_json_file_decode($manifest, array('associative' => true));
$js = $mdata['src/main.jsx']['file'];
$csss = $mdata['src/main.jsx']['css'];
$home_dist = GREENLET_CHILD_URL . '/frontend/home/dist/';

// 1. Cart
$raw_cart = WC()->cart->get_cart();
$cart = [
	'items' => [],
	'count' => WC()->cart->get_cart_contents_count(),
	'lineCount' => count( $raw_cart ),
	'url' => wc_get_cart_url(),
];
foreach ($raw_cart as $key => $cart_item) {
	$cartprod = $cart_item['data'];
	$imgs = ( $cartprod ? wp_get_attachment_image_src($cartprod->get_image_id(), 'thumbnail') : [] );
	$cart['items'][] = [
		'id'    => $cart_item['product_id'],
		'vid'   => $cart_item['variation_id'],
		'qty'   => $cart_item['quantity'],
		'name'  => $cartprod ? $cartprod->get_name() : '',
		'price' => $cartprod ? $cartprod->get_price(): '',
		'img'   => $imgs ? $imgs[0] : '',
	];
}

// 2. Hero
$hero = get_page_by_path( 'esp32-s3', OBJECT, 'product' );
$hero_img = '';
if ( $hero ) {
	$hero_data = wp_get_attachment_image_src( ( wc_get_product( $hero->ID ) )->get_image_id(), 'full' );
	$hero_url  = $hero_data ? $hero_data[0] : '';
}

// 3. Featured Products
$featured_products = wc_get_products(array(
	'featured' => true,
	'limit'    => 8,
	'status'   => 'publish',
) );
$featured = array();
foreach ( $featured_products as $featprod ) {
	$featprod_id = $featprod->get_id();
	$badges = function_exists( 'get_field' ) ? get_field( 'badges', $featprod_id ) : [];
	$priority = ['Bestseller', 'Popular', 'Pro', 'New', 'Value'];
	$badge = current( array_intersect( $priority, $badges ) ) ?: null;
	$featimg_id  = $featprod->get_image_id();
	$featimg_url = '';
	if ($featimg_id) {
		$featimg_data = wp_get_attachment_image_src( $featimg_id, 'medium' );
		$featimg_url  = $featimg_data ? $featimg_data[0] : '';
	}
	$featured[] = array(
		'id'       => $featprod_id,
		'name'     => $featprod->get_name(),
		'subtitle' => $featprod->get_short_description(),
		'price'    => $featprod->get_sale_price(),
		'regPrice' => $featprod->get_regular_price(),
		'image'    => $featimg_url,
		'badge'    => $badge,
	);
}

// 4. Sticky Posts
$sticky = [];
$sticky_ids = get_option('sticky_posts');
rsort( $sticky_ids );
$stickyquery = new WP_Query( [
	'post_type'           => 'post',
	'post__in'            => $sticky_ids,
	'posts_per_page'      => 3,
	'ignore_sticky_posts' => true
] );
$stickyposts = $stickyquery->posts;
foreach ( $stickyposts as $stickyp ) {
	$stickyimg = has_post_thumbnail( $stickyp->ID ) ? get_the_post_thumbnail_url( $stickyp->ID, 'medium' ) : '';
	$stckytags = get_the_tags( $stickyp->ID );
	$word_count = str_word_count( strip_tags( $stickyp->post_content ) );
	$read_time  = ceil( $word_count / 200 );
	$sticky[] = [
		'id'        => $stickyp->ID,
		'title'     => $stickyp->post_title,
		'excerpt'   => $stickyp->post_excerpt,
		'date'      => get_the_date( '', $stickyp->ID ),
		'img'       => $stickyimg,
		'permalink' => get_permalink( $stickyp->ID ),
		'tags'      => empty( $stckytags ) ? [] : array_map( fn($tag) => $tag->name, $stckytags),
		'readTime'  => $read_time . ' min read',
	];
}

$ssd = [
	'currency'  => html_entity_decode( get_woocommerce_currency_symbol() ),
	'featured'  => $featured,
	'hero'      => [
		'img'   => $hero_url,
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
	'sticky'    => $sticky,
	'ajaxUrl'   => admin_url('admin-ajax.php'),
	'nonce'     => wp_create_nonce( get_cart_nonce_name() ),
	'cart'      => $cart,
	'searchUrl' => get_home_url() . '/wp-content/plugins/ajax-search-for-woocommerce-premium/includes/Engines/TNTSearchMySQL/Endpoints/search.php'
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
