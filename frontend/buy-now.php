<?php

// Add Buy Now Button WooCommerce Single Product Page
add_action( 'woocommerce_after_add_to_cart_button', 'woo_add_buy_now_button' );
function woo_add_buy_now_button() {
	global $product;
	$product_id = $product->get_id();
	$checkout_url = wc_get_checkout_url() . '?add-to-cart=' . $product_id;
	?>
	<a href="<?php echo esc_url( $checkout_url ); ?>" class="button buy-now-button">
		<?php _e( 'Buy Now', 'woocommerce' ); ?>
	</a>
	<?php
}
