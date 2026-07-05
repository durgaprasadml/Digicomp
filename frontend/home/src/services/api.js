const ajaxUrl = window.dcSSD?.ajaxUrl || ''
const nonce = window.dcSSD?.nonce || ''
const searchUrl = window.dcSSD?.searchUrl || ''

export function getCart () {
	return window.dcSSD?.cart || {
		items: [],
		count: 0,
		lineCount: 0,
		url: '/cart',
	}
}

export async function postToCart(id, qty = 1) {
	const formData = { nonce, id, qty, action: 'add_to_cart' };
	try {
		const response = await fetch(ajaxUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams(formData).toString()
		});

		if ( ! response.ok ) throw new Error(`HTTP error! Status: ${response.status}`);

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error sending data:', error);
		return { success: false }
	}
}

export function getHero() {
	return window.dcSSD?.hero?.img || '/wp-content/plugins/woocommerce/assets/images/placeholder.png'
}

export function getSticky() {
	return window.dcSSD?.sticky || []
}

export function getFeatured() {
	return {
		products: window.dcSSD?.featured || [],
		currency: window.dcSSD?.currency || ''
	}
}

export function getEcoSystem() {
	return {
		mcus: window.dcSSD?.ecosystem.mcus || [],
		fpga: window.dcSSD?.ecosystem.fpga || '/wp-content/plugins/woocommerce/assets/images/placeholder.png',
	}
}

export async function fetchSearchResults(searchTerm) {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

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
