<?php
/**
 * Footer Template.
 *
 * The template for displaying the footer.
 *
 * @package greenlet
 */

if ( ! is_front_page() ) {
	echo '</div>';
	echo '</div>';
}

greenlet_markup_close();
greenlet_markup_close();
do_action( 'greenlet_before_semifooter' );
do_action( 'greenlet_semifooter' );
do_action( 'greenlet_after_semifooter' );

do_action( 'greenlet_before_footer' );
do_action( 'greenlet_footer' );
do_action( 'greenlet_after_footer' );

do_action( 'greenlet_after' );

wp_footer();

if ( false !== strpos( $_SERVER['HTTP_HOST'], 'skaiworld.com' ) ) {
	?>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y372XPEGVS"></script>
<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	gtag('js', new Date());

	gtag('config', 'G-Y372XPEGVS');
</script>
<?php } ?>

</body>
</html>
