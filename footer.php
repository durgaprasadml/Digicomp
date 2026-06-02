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

<script>
(function() {
	var toggleBtn = document.getElementById('theme-toggle');
	if (!toggleBtn) return;

	var sunIcon = toggleBtn.querySelector('.sun-icon');
	var moonIcon = toggleBtn.querySelector('.moon-icon');

	// Check saved theme
	var currentTheme = localStorage.getItem('theme');
	if (currentTheme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'dark');
		sunIcon.style.display = 'block';
		moonIcon.style.display = 'none';
	} else {
		// default is light
		document.documentElement.setAttribute('data-theme', 'light');
		sunIcon.style.display = 'none';
		moonIcon.style.display = 'block';
	}

	toggleBtn.addEventListener('click', function () {
		var theme = document.documentElement.getAttribute('data-theme');
		if (theme === 'light') {
			document.documentElement.setAttribute('data-theme', 'dark');
			localStorage.setItem('theme', 'dark');
			sunIcon.style.display = 'block';
			moonIcon.style.display = 'none';
		} else {
			document.documentElement.setAttribute('data-theme', 'light');
			localStorage.setItem('theme', 'light');
			sunIcon.style.display = 'none';
			moonIcon.style.display = 'block';
		}
	});
})();
</script>

</body>
</html>
