(function () {
	/**
	 * Dynamic Glowing & Staggered Particles for Hero
	 */
	function initHeroParticles() {
		var container = document.querySelector('.hero-particles');
		if (!container) return;

		var particleCount = 80;
		var particles = [];
		var mouseX = null;
		var mouseY = null;
		var targetParallaxX = 0;
		var targetParallaxY = 0;
		var currentParallaxX = 0;
		var currentParallaxY = 0;

		for (var i = 0; i < particleCount; i++) {
			var p = document.createElement('div');
			p.classList.add('particle');

			var size = Math.random() * 3 + 1;
			var opacity = Math.random() * 0.5 + 0.1;

			if (Math.random() > 0.85) {
				p.classList.add('glow');
				opacity = Math.random() * 0.4 + 0.6;
				size = Math.random() * 2 + 3;
			}

			p.style.width = size + 'px';
			p.style.height = size + 'px';
			p.style.opacity = opacity;
			p.style.left = '0px';
			p.style.top = '0px';

			container.appendChild(p);

			particles.push({
				element: p,
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				vx: (Math.random() - 0.5) * 0.5, // Slow drifting
				vy: (Math.random() - 0.5) * 0.5,
				repelX: 0,
				repelY: 0,
				factor: size * 0.05
			});
		}

		document.addEventListener('mousemove', function (e) {
			mouseX = e.clientX;
			mouseY = e.clientY;
			targetParallaxX = (mouseX / window.innerWidth) - 0.5;
			targetParallaxY = (mouseY / window.innerHeight) - 0.5;
		});

		document.addEventListener('mouseleave', function () {
			mouseX = null;
			mouseY = null;
		});

		function animateParticles() {
			var width = window.innerWidth;
			var height = window.innerHeight;

			// Smooth parallax tracking
			currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
			currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

			particles.forEach(function (p) {
				// Autonomous drifting
				p.x += p.vx;
				p.y += p.vy;

				// Wrap around edges natively
				if (p.x < -50) p.x = width + 50;
				else if (p.x > width + 50) p.x = -50;

				if (p.y < -50) p.y = height + 50;
				else if (p.y > height + 50) p.y = -50;

				// Interactive mouse repulsion
				var dx = 0;
				var dy = 0;
				if (mouseX !== null && mouseY !== null) {
					var distX = p.x - mouseX;
					var distY = p.y - mouseY;
					var distance = Math.sqrt(distX * distX + distY * distY);
					var repelRadius = 200; // Trigger distance

					if (distance < repelRadius && distance > 0) {
						var force = (repelRadius - distance) / repelRadius;
						// The closer they are, the harder they are pushed away
						dx = (distX / distance) * force * 100;
						dy = (distY / distance) * force * 100;
					}
				}

				// Smooth transition for repulsion
				p.repelX += (dx - p.repelX) * 0.1;
				p.repelY += (dy - p.repelY) * 0.1;

				// Apply parallax based on particle size (depth)
				var px = currentParallaxX * 300 * p.factor;
				var py = currentParallaxY * 300 * p.factor;

				// Final render coordinates
				var renderX = p.x + p.repelX + px;
				var renderY = p.y + p.repelY + py;

				p.element.style.transform = 'translate(' + renderX + 'px, ' + renderY + 'px)';
			});

			requestAnimationFrame(animateParticles);
		}

		animateParticles();
	}

	window.addEventListener('load', function () {
		initHeroParticles();
	});

})();
