(function () {
	function throttle(callback, limit) {
		var wait = false;
		return function () {
			if (!wait) {
				callback.call();
				wait = true;
				setTimeout(function () {
					wait = false;
				}, limit);
			}
		}
	}

	/**
	 * Fix Toggle Menu position.
	 */
	function fixMenu() {
		let prevToggle = null
		document.body.addEventListener('keyup', function (e) {
			if (e.key === 'Tab' || e.keyCode === '9') {
				var parent = document.activeElement.parentNode
				if (!parent.classList.contains('menu-item')) {
					var focused = document.querySelector('.menu-item.focus')
						; (focused !== null) && focused.classList.remove('focus')
						; (prevToggle !== null) && (prevToggle.checked = false)
				}
				; (parent.previousElementSibling !== null) && parent.previousElementSibling.classList.remove('focus')
					; (parent.nextElementSibling !== null) && parent.nextElementSibling.classList.remove('focus')
					; (parent.classList.contains('menu-item-has-children')) && parent.classList.add('focus')
					; (document.activeElement.classList.contains('menu-toggle')) && (document.activeElement.checked = true) && (prevToggle = document.activeElement)
			}
		});

		var fixToggle = function () {
			var togglers = document.getElementsByClassName('menu-toggle-button')
			for (var i = 0; i < togglers.length; i++) {
				var container = togglers[i].closest('.header-section')
				if (null === container) {
					container = togglers[i].closest('.footer-section')
				}
				togglers[i].style.top = '-' + ((container.offsetHeight / 2) + 12) + 'px'
			}
		}

		window.addEventListener('load', fixToggle);
		window.addEventListener('resize', fixToggle);
	}
	fixMenu()

	/**
	 * Fix tag.
	 */
	// function fixTag() {
	// 	var current = document.querySelector('meta[name="description"]');
	// 	if ( null === current ) {
	// 		var tag = document.createElement('meta');
	// 		tag.name = "description";
	// 		tag.content = 'Greenlet is worlds fastest WordPress theme. Its lightweight, efficient & loaded with hundreds of features like unlimited headers, footers & Visual style editor';
	// 		document.getElementsByTagName('head')[0].appendChild(tag);
	// 	}
	// }
	// fixTag()

	var lazy = document.querySelectorAll('.lazy');
	var advance = 300;

	function lazyLoad() {
		lazy.forEach(function (img, i) {
			if (img.getBoundingClientRect().top < window.innerHeight + window.pageYOffset + advance) {
				img.src = img.dataset.src
			}
		});
	}

	lazyLoad();

	window.addEventListener('scroll', throttle(lazyLoad, 100));
	window.addEventListener('resize', throttle(lazyLoad, 100));

	const headers = document.querySelectorAll('.header-section')
	if ( ( headers.length < 2 ) || ! headers[1].classList.contains( 'sticky' ) ) return

	let isStuck = false
	window.addEventListener('scroll', () => {
		const tp = headers[0].getBoundingClientRect().bottom
		if (tp <= 0) {
			if (!isStuck) {
				headers[1].classList.add('is-stuck')
				isStuck = true
			}
		} else {
			if (isStuck) {
				headers[1].classList.remove('is-stuck')
				isStuck = false
			}
		}
	})

	/* Theme toggle button */
	var toggleBtn = document.getElementById('theme-toggle')
	if (!toggleBtn) return

	var sunIcon = toggleBtn.querySelector('.sun-icon')
	var moonIcon = toggleBtn.querySelector('.moon-icon')

	// Check saved theme
	var currentTheme = localStorage.getItem('theme')
	if (currentTheme === 'dark') {
		document.documentElement.setAttribute('data-theme', 'dark')
		sunIcon.style.display = 'block'
		moonIcon.style.display = 'none'
	} else {
		// default is light
		document.documentElement.setAttribute('data-theme', 'light')
		sunIcon.style.display = 'none'
		moonIcon.style.display = 'block'
	}

	toggleBtn.addEventListener('click', function () {
		var theme = document.documentElement.getAttribute('data-theme')
		if (theme === 'light') {
			document.documentElement.setAttribute('data-theme', 'dark')
			localStorage.setItem('theme', 'dark')
			sunIcon.style.display = 'block'
			moonIcon.style.display = 'none'
		} else {
			document.documentElement.setAttribute('data-theme', 'light')
			localStorage.setItem('theme', 'light')
			sunIcon.style.display = 'none'
			moonIcon.style.display = 'block'
		}
	})
})();
