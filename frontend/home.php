<?php

$args = array(
	'primary' => 'main',
);

greenlet_markup('main', greenlet_attr($args));
?>



<!-- Hero Section (Full Height Wrapper with particles) -->
<section class="hero hero-split-layout">
	<div class="hero-bg">
		<div class="hero-gradient"></div>
		<div class="hero-particles"></div>
	</div>

	<div class="hero-content-wrapper">
		<!-- Top Half: Featured SBC Highlight -->
		<div class="hero-top-half center">
			<div class="featured-sbc-highlight">
				<h1 class="sbc-giant-title">SBC PRO-MAX</h1>
				<img class="sbc-product-image" src="/wp-content/themes/dc/assets/img/sbc.avif"
					alt="Featured Single Board Computer"
					onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'250\'><rect width=\'400\' height=\'250\' fill=\'rgba(255,255,255,0.1)\'/><text x=\'50%\' y=\'50%\' fill=\'#fff\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'sans-serif\' font-size=\'20\'>SBC Image Placeholder</text></svg>'">
				<p class="sbc-description">Next-generation quad-core computing power packed into our smallest form
					factor yet. Designed for edge AI.</p>
				<div class="cta-wrap">
					<a class="button secondary cta-button" href="#capabilities">Learn More</a>
					<a class="button primary cta-button" href="/shop/">Buy Now</a>
				</div>
			</div>
		</div>

		<!-- Bottom Half: Featured Products List -->
		<div class="hero-bottom-half">
			<div class="container">
				<h3 class="hero-bottom-title center">Trending Hardware</h3>
				<div class="woocommerce-featured hero-woocommerce-featured">
					<?php echo do_shortcode('[featured_products limit="4" columns="4"]'); ?>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Company Intro Section -->
<section class="company-intro center">
	<div class="container">
		<h2 class="intro-heading">Innovating the Future of Electronics</h2>
		<p class="intro-description">Digicomp Technologies specializes in designing cutting-edge development boards,
			single-board computers, FPGA boards, and advanced wireless modules.</p>
	</div>
</section>

<!-- Company Capabilities Section -->
<section id="capabilities" class="capabilities-section">
	<div class="container">
		<div class="section-header center">
			<h2 class="section-title">Our Capabilities</h2>
			<p class="section-subtitle">Delivering high-performance Electronic Design and Manufacturing solutions.</p>
		</div>
		<div class="capabilities-grid">
			<div class="capability-card">
				<div class="card-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
						<rect x="9" y="9" width="6" height="6"></rect>
						<line x1="9" y1="1" x2="9" y2="4"></line>
						<line x1="15" y1="1" x2="15" y2="4"></line>
						<line x1="9" y1="20" x2="9" y2="23"></line>
						<line x1="15" y1="20" x2="15" y2="23"></line>
						<line x1="20" y1="9" x2="23" y2="9"></line>
						<line x1="20" y1="14" x2="23" y2="14"></line>
						<line x1="1" y1="9" x2="4" y2="9"></line>
						<line x1="1" y1="14" x2="4" y2="14"></line>
					</svg>
				</div>
				<h3>Single Board Computers</h3>
				<p>Custom-designed SBCs tailored for high computing power in compact form factors.</p>
			</div>
			<div class="capability-card">
				<div class="card-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
						<rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
						<line x1="6" y1="6" x2="6.01" y2="6"></line>
						<line x1="6" y1="18" x2="6.01" y2="18"></line>
					</svg>
				</div>
				<h3>FPGA Boards</h3>
				<p>Advanced FPGA development boards for rapid prototyping and deployment.</p>
			</div>
			<div class="capability-card">
				<div class="card-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
						stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
						<path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
						<path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
						<line x1="12" y1="20" x2="12.01" y2="20"></line>
					</svg>
				</div>
				<h3>Wireless Modules</h3>
				<p>Integration of Bluetooth, WiFi, and other RF technologies for connected devices.</p>
			</div>
		</div>
	</div>
</section>
