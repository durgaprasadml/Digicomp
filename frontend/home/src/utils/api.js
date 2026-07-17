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

export async function fetchPageData(path) {
	try {
		const { homeUrl, dcApiUrl } = PageStore.get();
		const response = await fetch(`${ dcApiUrl }${ path }`);
		if (!response.ok) throw new Error('REST API error');
		const data = await response.json();

		const { ...pageData } = data;

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
