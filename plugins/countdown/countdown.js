const cdBg = document.createElement( 'div' )
cdBg.classList.add( 'cd-bg', 'counting' )
cdBg.innerHTML = `
<div class="cd-wrap">
	<div id="countdown"></div>
	<div class="cd-action">
		<div id="launch" class="button cd-number">LAUNCH</div>
		<div class="cd-msg cd-number">Launching soon!</div>
	</div>
</div>`

document.body.appendChild( cdBg )

if ( countdown.isAdmin ) {
	cdBg.classList.add( 'admin' )
	document.getElementById('launch').addEventListener( 'click', function() {
		fetch( countdown.ajaxurl, { method: 'POST', body: 'action=launch', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } )
			.then(res => res.json()).then(data => {
				if (data === 1) succeed_launch()
			})
			.catch(err => console.log(err));
	} )
}

const x = setInterval(tick, 1000);
let checkerInt = false

const countDownDate = new Date( countdown.time ).getTime();
function tick() {
	const now = new Date().getTime();
	const distance = countDownDate - now;

	if ( distance < 0 ) {
		clearInterval(x)
		cdBg.classList.remove( 'counting' )
		if ( ! countdown.isAdmin ) {
			checkerInt = setInterval( check_active, 2000 )
		}
		return
	}

	const days = Math.floor(distance / (1000 * 60 * 60 * 24))
	const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((distance % (1000 * 60)) / 1000)

	document.getElementById( 'countdown' ).innerHTML = `
	<div class="cd-item"><div class="cd-number">${days}</div><div class="cd-text">Days</div></div>
	<div class="cd-item"><div class="cd-number">${hours}</div><div class="cd-text">Hours</div></div>
	<div class="cd-item"><div class="cd-number">${minutes}</div><div class="cd-text">Minutes</div></div>
	<div class="cd-item"><div class="cd-number">${seconds}</div><div class="cd-text">Seconds</div></div>
	`
}
tick()

function succeed_launch() {
	run_confetti()
	document.body.classList.remove( 'cd-active' )
	if ( checkerInt !== false ) clearInterval( checkerInt )
}

function check_active() {
	fetch( countdown.ajaxurl, { method: 'POST', body: 'action=check_active', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } } )
		.then(res => res.json()).then(data => {
			if (data === 0) succeed_launch()
		})
		.catch(err => console.log(err));
}

function run_confetti() {
	const duration = 15 * 1000,
		animationEnd = Date.now() + duration,
		defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	const interval = setInterval(function () {
		const timeLeft = animationEnd - Date.now();

		if (timeLeft <= 0) {
			return clearInterval(interval);
		}

		const particleCount = 50 * (timeLeft / duration);

		// since particles fall down, start a bit higher than random
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
			})
		);
		confetti(
			Object.assign({}, defaults, {
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
			})
		);
	}, 250);
}
