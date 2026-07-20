<?php

if (! defined('ABSPATH')) {
	exit;
}

define('SITE_VERSION', '0.2.0');
define('CHILD_ASSETS_DIR', get_stylesheet_directory() . '/assets');
define('CHILD_ASSETS_URL', get_stylesheet_directory_uri() . '/assets');

require_once get_stylesheet_directory() . '/frontend/page-data.php';
require_once get_stylesheet_directory() . '/frontend/renderer.php';
require_once get_stylesheet_directory() . '/frontend/svg.php';
require_once get_stylesheet_directory() . '/frontend/scripts.php';
require_once get_stylesheet_directory() . '/frontend/buy-now.php';
require_once get_stylesheet_directory() . '/inc/api/index.php';

// FOOTER.

/**
 * SKAI Site copyright.
 *
 * @return string Copyright Text.
 */
function skai_copyright()
{
	$text  = sprintf('<div %s><p>', greenlet_attr('copyright'));
	$text .= sprintf(
		'Crafted <span class="love">&#9775;</span> in Puttur</p><p>&copy; %1$s &middot; <a href="%2$s">%3$s</a></p></div>',
		date_i18n(__('Y', 'greenlet')),
		esc_url(get_home_url()),
		get_bloginfo('name'),
	);
	echo wp_kses_post($text);
}

add_filter('greenlet_after_footer_1_columns', 'skai_copyright');

// FOOTER END.

// CASHBACK.

/**
 * Add proof attachment id to global scope.
 *
 * @param string $attach_id Attachment ID.
 */
function temp_save_proof($attach_id)
{
	$GLOBALS['cashback'] = array('proof' => $attach_id);
}
add_action('nmr_create_attachment_id_generated', 'temp_save_proof');

/**
 * Update cashback proof link.
 *
 * @param string $mid Meta ID.
 * @param string $pid Post ID.
 * @param string $mkey Meta Key.
 */
function update_proof_link($mid, $pid, $mkey)
{
	$proof = $GLOBALS['cashback']['proof'] ?? '';
	if ('_field_proof' === $mkey && '' !== $proof) {
		update_post_meta($pid, $mkey, wp_get_attachment_url((int) $proof));
	} elseif ('_field_cashback' === $mkey) {
		update_post_meta($pid, $mkey, $GLOBALS['cashback']['cashback']);
	}
}

add_action('added_post_meta', 'update_proof_link', 10, 3);

function get_cashback($amount)
{
	$cb = 0;
	if (null !== $amount && is_numeric($amount)) {
		$percent = 0.05;
		if ($amount > 10000) {
			$percent = 0.02;
		}
		$cb = wp_rand(1, round((int) $amount * $percent));
	}
	return $cb;
}

function add_cashback_result($result, $submission)
{
	$GLOBALS['cashback']['cashback'] = get_cashback($submission->get_posted_data('amount'));
	$result['message'] = str_replace('{cb}', $GLOBALS['cashback']['cashback'], $result['message']);
	return $result;
}

add_filter('wpcf7_submission_result', 'add_cashback_result', 10, 2);

// CASHBACK END.

// WOOCOMMERCE.

function sk_buy_to_cart()
{
	if (isset($_GET['buy_now'])) {
		$product = get_page_by_path(sanitize_text_field($_GET['buy_now']), OBJECT, 'product');
		if (! WC()->cart->find_product_in_cart($product->ID)) {
			if (WC()->cart->get_cart_contents_count() !== 0) {
			}
			// Without this dummy call, product is not added to cart.
			WC()->cart->add_to_cart($product->ID, 10);
		}

		if (wp_safe_redirect(wc_get_cart_url())) {
			exit;
		}
	}
}

add_action('wp_loaded', 'sk_buy_to_cart');

/**
 * Hide shipping rates when free shipping is available.
 */
function sk_hide_shipping_when_free($rates)
{
	$free = array();
	foreach ($rates as $rate_id => $rate) {
		if ('free_shipping' === $rate->method_id) {
			$free[$rate_id] = $rate;
		}
	}
	return ! empty($free) ? $free : $rates;
}
add_filter('woocommerce_package_rates', 'sk_hide_shipping_when_free', 100);

function gls_checkout_extra()
{
	if (! is_checkout() || is_wc_endpoint_url('order-pay') || is_wc_endpoint_url('order-received')) {
		return;
	} ?>
	<div class="checkout-extra">
		<div class="item support">
			<div class="title">Accepted payment methods:</div>
			<div class="details">
				<div class="icon">
					<?php echo greenlet_get_file_contents(CHILD_ASSETS_DIR . '/icons/checkout/upi.svg'); ?>
				</div>
				<div class="icon">
					<?php echo greenlet_get_file_contents(CHILD_ASSETS_DIR . '/icons/checkout/razorpay.svg'); ?>
				</div>
				<div class="icon">
					<?php echo greenlet_get_file_contents(CHILD_ASSETS_DIR . '/icons/checkout/visa.svg'); ?>
				</div>
				<div class="icon">
					<?php echo greenlet_get_file_contents(CHILD_ASSETS_DIR . '/icons/checkout/mastercard.svg'); ?>
				</div>
			</div>
		</div>
		<div class="item security">
			<div class="details">
				<div class="icon">
					<?php echo greenlet_get_file_contents(CHILD_ASSETS_DIR . '/icons/checkout/security.svg'); ?>
				</div>
				<div class="desc">SSL Secure Payment. Your information is protected by 256-bit SSL encryption.</div>
			</div>
		</div>
	</div>
<?php
}

add_action('greenlet_before_right_sidebar', 'gls_checkout_extra');

function sk_explore_shop($o)
{
?>
	<div class="checkout-explore">
		<h4>Explore more Products</h4>
		<a href="/shop" class="button">Keep shopping</a>
	</div>
<?php
}

add_action('woocommerce_thankyou', 'sk_explore_shop');

function sk_rename_additional_info_tab($tabs)
{
	if (isset($tabs['additional_information'])) {
		$tabs['additional_information']['title'] = __('Specifications', 'woocommerce');
	}
	return $tabs;
}
add_filter('woocommerce_product_tabs', 'sk_rename_additional_info_tab', 98);

add_filter('woocommerce_product_additional_information_heading', 'sk_rename_additional_info_heading');
function sk_rename_additional_info_heading()
{
	return __('Specifications', 'woocommerce');
}

/**
 * Add plus/minus buttons to WooCommerce quantity input.
 */
function sk_add_quantity_buttons_script()
{
	if (! function_exists('is_product') || (! is_product() && ! is_cart())) {
		return;
	}
?>
	<script>
		jQuery(document).ready(function($) {
			function addQuantityButtons() {
				$('div.quantity:not(.buttons_added), td.quantity:not(.buttons_added)').addClass('buttons_added').append('<button type="button" class="plus">+</button>').prepend('<button type="button" class="minus">-</button>');
			}

			addQuantityButtons();

			$(document).on('updated_wc_div', function() {
				addQuantityButtons();
			});

			$(document).on('click', '.plus, .minus', function() {
				var $qty = $(this).closest('.quantity').find('.qty'),
					currentVal = parseFloat($qty.val()),
					max = parseFloat($qty.attr('max')),
					min = parseFloat($qty.attr('min')),
					step = $qty.attr('step');

				if (!currentVal || currentVal === '' || currentVal === 'NaN') currentVal = 0;
				if (max === '' || max === 'NaN') max = '';
				if (min === '' || min === 'NaN') min = 0;
				if (step === 'any' || step === '' || step === undefined || parseFloat(step) === 'NaN') step = 1;

				if ($(this).is('.plus')) {
					if (max && (currentVal >= max)) {
						$qty.val(max);
					} else {
						$qty.val((currentVal + parseFloat(step)));
					}
				} else {
					if (min && (currentVal <= min)) {
						$qty.val(min);
					} else if (currentVal > 0) {
						$qty.val((currentVal - parseFloat(step)));
					}
				}
				$qty.trigger('change');
			});
		});
	</script>
<?php
}
add_action('wp_footer', 'sk_add_quantity_buttons_script', 50);

/**
 * Dequeue WooCommerce default styles on single product pages.
 */
function sk_dequeue_wc_styles_on_single($enqueue_styles)
{
	if (function_exists('is_product') && is_product()) {
		unset($enqueue_styles['woocommerce-general']);
		// unset($enqueue_styles['woocommerce-layout']);
		unset($enqueue_styles['woocommerce-smallscreen']);
	}
	return $enqueue_styles;
}
add_filter('woocommerce_enqueue_styles', 'sk_dequeue_wc_styles_on_single', 99);

// Include ACF Custom Fields helper.
require_once get_stylesheet_directory() . '/inc/acf-product-fields.php';

/**
 * Custom Header Menu with Icons.
 */
function dc_custom_header_menu()
{
	$myaccount_url = function_exists('wc_get_page_permalink') ? wc_get_page_permalink('myaccount') : home_url('/my-account/');
	$wishlist_url  = class_exists('Dc_Wishlist_Helper') ? Dc_Wishlist_Helper::get_url() : home_url('/wishlist/');
	$cart_url      = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/cart/');

	$myaccount_icon = function_exists('get_my_svg_icon') ? get_my_svg_icon('user') : '';
	$wishlist_icon  = function_exists('get_my_svg_icon') ? get_my_svg_icon('heart') : '';
	$cart_icon      = function_exists('get_my_svg_icon') ? get_my_svg_icon('cart') : '';

	$cart_count = (function_exists('WC') && WC()->cart) ? WC()->cart->get_cart_contents_count() : 0;

	$wishlist_count = 0;
	if (class_exists('Dc_Wishlist_Helper')) {
		$wishlist_count = Dc_Wishlist_Helper::get_count();
	}
?>
	<div class="dc-search">
		<?php echo do_shortcode('[fibosearch]'); ?>
	</div>
	<div class="dc-header-menu">
		<a href="<?php echo esc_url($myaccount_url); ?>" class="dc-header-menu-item dc-my-account" title="<?php esc_attr_e('My Account', 'dc'); ?>">
			<span class="dc-menu-icon"><?php echo $myaccount_icon; ?></span>
		</a>
		<a href="<?php echo esc_url($wishlist_url); ?>" class="dc-header-menu-item dc-wishlist" title="<?php esc_attr_e('Wishlist', 'dc'); ?>">
			<span class="dc-menu-icon">
				<?php echo $wishlist_icon; ?>
				<?php if ($wishlist_count > 0) : ?>
					<span class="dc-menu-badge dc-wishlist-count"><?php echo esc_html($wishlist_count); ?></span>
				<?php endif; ?>
			</span>
		</a>
		<a href="<?php echo esc_url($cart_url); ?>" class="dc-header-menu-item dc-cart" title="<?php esc_attr_e('Cart', 'dc'); ?>">
			<span class="dc-menu-icon">
				<?php echo $cart_icon; ?>
				<span class="dc-menu-badge dc-cart-count <?php echo ($cart_count > 0) ? 'has-items' : 'empty'; ?>"><?php echo esc_html($cart_count); ?></span>
			</span>
		</a>
	</div>

	<!-- Theme Toggle Button (Global) -->
	<button class="theme-toggle" id="theme-toggle" aria-label="Toggle Theme">
		<svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
			<circle cx="12" cy="12" r="5"></circle>
			<line x1="12" y1="1" x2="12" y2="3"></line>
			<line x1="12" y1="21" x2="12" y2="23"></line>
			<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
			<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
			<line x1="1" y1="12" x2="3" y2="12"></line>
			<line x1="21" y1="12" x2="23" y2="12"></line>
			<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
			<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
		</svg>
		<svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
		</svg>
	</button>
<?php
}
add_action('greenlet_after_header_2_col_2', 'dc_custom_header_menu');

function dc_get_top_badge( $badges ) {
	$priority = ['Bestseller', 'Popular', 'Pro', 'New', 'Value'];
	$badge = is_array( $badges ) ? current( array_intersect( $priority, $badges ) ) : null;
	return $badge ? $badge : null;
}

function read_time( $content = '' ) {
	$word_count = str_word_count( strip_tags( $content ) );
	return ceil( $word_count / 200 ) . ' min read';
}

function dc_login_expiration($expiration, $user_id, $remember) {
	if ( $remember ) { // If "Remember Me" is checked
		$expiration = 7776000; // 90 days
	}
	return $expiration;
}
add_filter('auth_cookie_expiration', 'dc_login_expiration', 99, 3);
