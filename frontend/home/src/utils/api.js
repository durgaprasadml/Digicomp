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

export async function postToCart( id, qty = 1 ) {
	return await postWPAjax( { id, qty, action: 'add_to_cart' } )
}

export async function fetchSearchResults(searchTerm) {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
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
