<?php

function get_cache_path( $uri ) {
	$cache_base = wp_upload_dir()['basedir'] . '/dc-cache';
	$req_hash   = substr( md5( $uri), 0, 8 );
	return [
		'html' => $cache_base . '/html/ssr-' . $req_hash . '.html',
		'job'  => $cache_base . '/jobs/job-' . $req_hash . '.json',
	];
}

function get_ssr_html( $uri ) {
	$midnight = strtotime( 'today 3:00 AM' );
	if ( time() < $midnight ) {
		$midnight = strtotime( '-1 day', $midnight );
	}
	$html_path = get_cache_path( $uri )['html'];
	$serve_cache = file_exists( $html_path ) && filemtime( $html_path ) > $midnight;
	return $serve_cache ? file_get_contents( $html_path ) : '';
}

function add_ssr_job( $uri, $ssd ) {
	$job_path = get_cache_path( $uri )['job'];
	$job_data = [
		'url'   => $uri,
		'dcSSD' => $ssd,
	];
	return file_put_contents( $job_path, wp_json_encode( $job_data ) );
}

function get_react_assets() {
	$manifest = get_stylesheet_directory() . '/frontend/home/dist/_manifest.json';
	$mdata = wp_json_file_decode( $manifest, array( 'associative' => true ) );
	return [
		'js' => $mdata['src/main.jsx']['file'],
		'csss' => $mdata['src/main.jsx']['css'],
		'dist' => GREENLET_CHILD_URL . '/frontend/home/dist/',
	];
}

function dc_render() {
	$uri = parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH );
	if ( ! in_array( $uri, get_react_pages() ) ) return;

	$assets = get_react_assets();
	$html = get_ssr_html( $uri );
	$data = get_page_data( $uri, ! $html );
	if ( ! $html ) {
		add_ssr_job( $uri, $data['ssd'] );
	}
	?>
<!doctype html>
<html lang="en" data-theme="<? echo $data['theme']; ?>">
<head>
	<meta charset="UTF-8" />
	<link rel="icon" type="image/svg+xml" href="/wp-content/themes/dc/assets/img/logo.svg" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="keywords" content="<? echo $data['kws']; ?>" />
	<meta name="theme-color" content="<? echo $data['color']; ?>" />
	<meta name="description" content="<? echo $data['desc']; ?>" />
	<title><? echo $data['title']; ?></title>
	<?php
	foreach ( $assets['csss'] as $css ) {
		echo '<link rel="stylesheet" href="' . $assets['dist'] . $css . '">';
	}
	?>
</head>
<body>
	<?php echo $html ? $html :
	'<div id="dc-app">
	</div><script>var dcSSD = ' . wp_json_encode( $data['ssd'] ) . ';</script>'; ?>
	<script type="module" src="<?php echo $assets['dist'] . $assets['js'] ?>" defer></script>
</body>
</html>
	<?php
	exit;
}

add_action( 'template_redirect', 'dc_render' );
