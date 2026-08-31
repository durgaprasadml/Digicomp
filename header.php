<?php
/**
 * Header Template.
 *
 * The header for the theme.
 *
 * @package greenlet
 */

do_action( 'greenlet_head' );

wp_head();

echo '<meta name="theme-color" content="#23b887">';
?>
	</head>
<?php

$body_attribute = greenlet_attr( 'body ' . implode( ' ', get_body_class() ) );
printf( '<body %s>', wp_kses( $body_attribute, null ) );

do_action( 'greenlet_before_topbar' );
do_action( 'greenlet_topbar' );
do_action( 'greenlet_after_topbar' );

do_action( 'greenlet_before_header' );
do_action( 'greenlet_header' );
do_action( 'greenlet_after_header' );

greenlet_markup( 'site-content', greenlet_attr( 'site-content' ) );

if ( ! is_front_page() ) {
	echo '<div class="container">';
	echo '<div class="row">';
}
