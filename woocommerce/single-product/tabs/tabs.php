<?php
/**
 * Single Product tabs (Overridden to stack sections instead of tabs)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Filter tabs and allow third parties to add their own.
 *
 * Each tab is an array containing title, callback and priority.
 *
 * @see woocommerce_default_product_tabs()
 */
$product_tabs = apply_filters( 'woocommerce_product_tabs', array() );

if ( ! empty( $product_tabs ) ) : ?>

	<div class="woocommerce-tabs-stacked">
		<?php foreach ( $product_tabs as $key => $product_tab ) : ?>
			<div class="woocommerce-stacked-panel woocommerce-stacked-panel--<?php echo esc_attr( $key ); ?> panel entry-content" id="tab-<?php echo esc_attr( $key ); ?>">
				
				<?php 
				$heading = apply_filters( 'woocommerce_product_' . $key . '_tab_title', $product_tab['title'], $key );
				?>
				<h2><?php echo wp_kses_post( $heading ); ?></h2>
				
				<div class="woocommerce-stacked-panel-content">
					<?php
					if ( isset( $product_tab['callback'] ) ) {
						call_user_func( $product_tab['callback'], $key, $product_tab );
					}
					?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>

<?php endif; ?>
