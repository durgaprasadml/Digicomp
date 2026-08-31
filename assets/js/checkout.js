function updateAddress() {
	var addr = document.getElementById( 'billing_address_1' )
	var city = document.getElementById( 'billing_city' )
	var state = document.getElementById( 'billing_state' )
	var pin = document.getElementById( 'billing_postcode' )
	var country = document.getElementById( 'billing_country' )

	// Todo: If address does not exist

	fetch( 'https://ipapi.co/json/' ).then( r => r.json() )
	.then( function( data ) {
		if ( ( addr.value === '' ) ) { addr.value = data.city }
		if ( ( city.value === '' ) ) { city.value = data.city }
		if ( ( pin.value === '' ) ) { pin.value = data.postal }
		if ( ( state.value === '' ) ) {
			state.value = data.region_code
			state.dispatchEvent( new Event( 'change' ) )
		}
		if ( ( country.value === '' ) ) {
			country.value = data.country
			country.dispatchEvent( new Event( 'change' ) )
		}
	} )
}

( function() {
	const co = document.getElementsByClassName( 'wp-block-woocommerce-checkout-actions-block' )
	const sb = document.getElementsByClassName( 'wp-block-woocommerce-checkout-totals-block' )
	sb.length && sb[0].appendChild( co[0] )

	// updateAddress()
} )();
