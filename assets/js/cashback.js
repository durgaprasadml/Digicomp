var inputs = document.querySelectorAll('.wpcf7-file');
Array.prototype.forEach.call(inputs, function (input) {
	var label = input.parentElement.nextElementSibling;
	var labelVal = label.innerHTML;

	input.addEventListener('change', function (e) {
		var fileName = '';
		if (this.files && this.files.length > 1)
			fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
		else
			fileName = e.target.value.split( '\\' ).pop();

		if (fileName)
			label.querySelector('span').innerHTML = fileName;
		else
			label.innerHTML = labelVal;
	});
});

const op = document.getElementsByClassName('wpcf7-response-output')[0]
const observer = new MutationObserver(function (mutations) {
	if ( ! op.innerText.includes( 'Your cashback' ) ) { return; }

	const [ greet, second ] = op.innerText.split('!')
	const [ msg1, third ] = second.split( 'Rs.' );
	const [ cb, ...msg2Parts ] = third.split( ' ' );

	const overlay = document.createElement( 'div' );
	overlay.classList.add( 'overlay' );
	overlay.innerHTML = `<div class="overlay-content">
	<p class="cb-greet">${greet}!</p>
	<p class="cb-msg">${msg1}</p>
	<div class="cb-cb">Rs. ${cb}</div>
	<p class="cb-msg">${msg2Parts.join( ' ' )}</p>
	<a class="button cb-return" href="/">Return Home</a>
	<div>`

	op.after( overlay );

	confetti({
		particleCount: 180,
		spread: 110,
		origin: { y: 0.99 },
		startVelocity: 80,
		ticks: 400,
	});
});
observer.observe(op, { childList: true });
