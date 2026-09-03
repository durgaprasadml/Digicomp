import { UserStore } from "../stores/UserStore";
import { PageStore } from "../stores/PageStore";

async function postWPAjax( formData ) {
	const { nonce } = UserStore.get()
	const { ajaxUrl } = PageStore.get()
	try {
		const response = await fetch(ajaxUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams( { ...formData, nonce } ).toString()
		});

		if ( ! response.ok ) throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error sending data:', error);
		return { success: false }
	}
}

export async function fetchUserData() {
	const ud = await postWPAjax( { action: 'dc_user_data' } )
	if ( ! ud?.success ) return {}
	return ud?.data
}

async function dcApiFetch( endpoint, options = {} ) {
	try {
		const { dcApiUrl } = PageStore.get()
		const { nonce, wpNonce } = UserStore.get()

		const headers = { 'Content-Type': 'application/json', ...options.headers }
		if ( nonce ) { headers['Nonce'] = nonce }
		if ( wpNonce ) { headers['X-WP-Nonce'] = wpNonce }

		const response = await fetch( `${ dcApiUrl }${ endpoint }`, { ...options, headers } )

		if ( ! response.ok ) {
			throw new Error( `Failed to fetch ${ endpoint }` )
		}

		return await response.json()
	} catch ( error ) {
		console.error( `Error in dcApiFetch (${ endpoint }):`, error )
		return null
	}
}

export async function fetchPageData( path ) {
	try {
		const { ...pageData } = await dcApiFetch( path )
		// Reconstruct the expected shape so components don't break
		return {
			ssd: {
				pages: {
					[path]: pageData
				}
			}
		};
	} catch (error) {
		console.error(`Error fetching ${path} REST API:`, error);
		// Todo: Retry once or twice?
		return null;
	}
}

async function storeApiFetch(endpoint, options = {}) {
	const { stApiUrl } = PageStore.get()
	const { nonce } = UserStore.get()
	const url = `${ stApiUrl }${ endpoint }`
	const headers = { 'Content-Type': 'application/json', ...options.headers }

	if ( nonce ) { headers['Nonce'] = nonce }

	try {
		const response = await fetch( url, { ...options, headers } )
		if ( ! response.ok) {
			throw new Error( `Store API error: ${ response.statusText }` )
		}
		return await response.json()
	} catch ( error ) {
		console.error( `Error in Store API (${ endpoint }):`, error )
		return null
	}
}

export async function fetchCart() {
	return await storeApiFetch( 'cart' )
}

export async function addCartItem(id, qty = 1) {
	return await storeApiFetch( 'cart/add-item', {
		method: 'POST',
		body: JSON.stringify( { id, quantity: qty } )
	} )
}

export async function updateCartItem( key, qty ) {
	return await storeApiFetch( 'cart/update-item', {
		method: 'POST',
		body: JSON.stringify( { key, quantity: qty } )
	} )
}

export async function removeCartItem( key ) {
	return await storeApiFetch( 'cart/remove-item', {
		method: 'POST',
		body: JSON.stringify( { key } )
	} )
}

export async function fetchSearchResults( searchTerm ) {
  if ( ! searchTerm || searchTerm.length < 3 ) {
    return []
  }

  const { searchUrl } = PageStore.get()

  try {
    const response = await fetch(
      `${ searchUrl }?s=${ encodeURIComponent(searchTerm) }`
    );

    if (!response.ok) {
      throw new Error(`Error fetching search results: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}

export async function updateCustomer( data ) {
	return await storeApiFetch( 'cart/update-customer', {
		method: 'POST',
		body: JSON.stringify( data )
	} )
}

export async function processCheckout( data ) {
	return await storeApiFetch( 'checkout', {
		method: 'POST',
		body: JSON.stringify( data )
	} )
}

export async function updateAccountDetails( data ) {
	try {
		return await dcApiFetch( 'my-account/update', {
			method: 'POST',
			body: JSON.stringify( data )
		} )
	} catch ( error ) {
		console.error( 'Error updating account details:', error )
		return null;
	}
}

export async function fetchWishLists() {
	return await dcApiFetch( 'wishlist' )
}

export async function fetchWishlist( id ) {
	return await dcApiFetch( 'wishlist/' + id )
}

export async function createWishlist( name ) {
	return await dcApiFetch( 'wishlist/create', {
		method: 'POST',
		body: JSON.stringify( { name } )
	} )
}

export async function deleteWishlist( id ) {
	return await dcApiFetch( `wishlist/delete/${ id }`, {
		method: 'POST'
	} )
}

export async function addWishlistItem( id, product_id ) {
	return await dcApiFetch( `wishlist/${ id }/add`, {
		method: 'POST',
		body: JSON.stringify( { product_id } )
	} )
}

export async function removeWishlistItem( id, product_id ) {
	return await dcApiFetch(`wishlist/${ id }/remove`, {
		method: 'POST',
		body: JSON.stringify( { product_id } )
	} )
}

export async function login( username, password, remember = false, phoneWebsite = '' ) {
	return await dcApiFetch( 'auth/login', {
		method: 'POST',
		body: JSON.stringify( { username, password, remember, phone_website: phoneWebsite } )
	} )
}

export async function logout() {
	try {
		if ( typeof localStorage !== 'undefined' ) {
			// Clear all user AI tokens
			for ( let i = localStorage.length - 1; i >= 0; i-- ) {
				const key = localStorage.key( i )
				if ( key && key.startsWith( 'digicomp_ai_session' ) ) {
					localStorage.removeItem( key )
				}
			}
		}
	} catch ( err ) {
		console.warn( 'Error clearing local AI session on logout:', err )
	}

	return await dcApiFetch( 'auth/logout', { method: 'POST' } )
}

export async function register( nameOrData, emailArg = '', passwordArg = '', phoneWebsiteArg = '' ) {
	let payload = {}
	if ( typeof nameOrData === 'object' && nameOrData !== null ) {
		payload = {
			name: nameOrData.name || nameOrData.username || '',
			email: nameOrData.email || '',
			password: nameOrData.password || '',
			phone_website: nameOrData.phoneWebsite || nameOrData.phone_website || '',
		}
	} else {
		payload = {
			name: nameOrData,
			email: emailArg,
			password: passwordArg,
			phone_website: phoneWebsiteArg,
		}
	}

	return await dcApiFetch( 'auth/register', {
		method: 'POST',
		body: JSON.stringify( payload )
	} )
}

export async function forgotPassword( email, phoneWebsite = '' ) {
	return await dcApiFetch( 'auth/forgot-password', {
		method: 'POST',
		body: JSON.stringify( { email, phone_website: phoneWebsite } )
	} )
}

export async function loginWithGoogle( credential ) {
	return await dcApiFetch( 'auth/google', {
		method: 'POST',
		body: JSON.stringify( { credential } )
	} )
}

export async function sendPhoneOtp( phone, phoneWebsite = '' ) {
	return await dcApiFetch( 'auth/phone/send-otp', {
		method: 'POST',
		body: JSON.stringify( { phone, phone_website: phoneWebsite } )
	} )
}

export async function verifyPhoneOtp( phone, otp, phoneWebsite = '' ) {
	return await dcApiFetch( 'auth/phone/verify-otp', {
		method: 'POST',
		body: JSON.stringify( { phone, otp, phone_website: phoneWebsite } )
	} )
}

