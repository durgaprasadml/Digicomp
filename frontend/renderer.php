<?php

function get_cache_path( $path ) {
	$cache_base = wp_upload_dir()['basedir'] . '/dc-cache';
	$req_hash   = substr( md5( $path), 0, 8 );
	return [
		'html' => $cache_base . '/html/ssr-' . $req_hash . '.html',
		'job'  => $cache_base . '/jobs/job-' . $req_hash . '.json',
	];
}

function get_ssr_html( $path ) {
	$midnight = strtotime( 'today 3:00 AM' );
	if ( time() < $midnight ) {
		$midnight = strtotime( '-1 day', $midnight );
	}
	$html_path = get_cache_path( $path )['html'];
	$serve_cache = file_exists( $html_path ) && filemtime( $html_path ) > $midnight;
	return $serve_cache ? file_get_contents( $html_path ) : '';
}

function add_ssr_job( $path, $ssd ) {
	$job_path = get_cache_path( $path )['job'];
	$job_data = [
		'path'  => $path,
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
	$uri = trim( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '', '/' );
	$path = ( '' === $uri ) ? 'home' : $uri;
	$routes = dc_api_routes();
	$is_react = false;
	foreach ( $routes as $route => $args ) {
		if ( preg_match( '#^' . $route . '$#', $path ) ) {
			$is_react = true;
			break;
		}
	}
	if ( ! $is_react ) return;

	$assets = get_react_assets();
	$html = get_ssr_html( $path );
	$data = get_page_data( $path, !! $html );
	if ( ! $html ) {
		add_ssr_job( $path, $data );
	}
	$head = $data['pages'][ $path ]['head'];
	$default_head = dc_default_head();
	?>
<!doctype html>
<html lang="en" data-theme="<? echo $head['theme'] ?? $default_head['theme']; ?>">
<head>
	<meta charset="UTF-8" />
	<link rel="icon" type="image/svg+xml" href="/wp-content/themes/dc/assets/img/logo.svg" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="theme-color" content="<? echo $head['color'] ?? $default_head['color']; ?>" />
	<meta name="description" content="<? echo $head['desc'] ?? $default_head['desc']; ?>" />
	<title><? echo $head['title'] ?? $default_head['title']; ?></title>
	<?php
	foreach ( $assets['csss'] as $css ) {
		echo '<link rel="stylesheet" href="' . $assets['dist'] . $css . '">';
	}
	?>
</head>
<body>
	<?php echo $html ? $html :
	'<div id="dc-app">
	</div><script>var dcSSD = ' . wp_json_encode( $data ) . ';</script>'; ?>
	<script type="module" src="<?php echo $assets['dist'] . $assets['js'] ?>" defer></script>
</body>
</html>
	<?php
	exit;
}

add_action( 'template_redirect', 'dc_render' );
