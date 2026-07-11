import { Store, useStore } from './Store'
import { fetchPageData } from '../utils/api'
import { getCleanPath } from '../utils/helper'

const initialState = globalThis.window?.dcSSD || {
	homeUrl: '/',
	dcApiUrl: '/wp-json/dc/v1/',
	ajaxUrl: '/wp-admin/admin-ajax.php',
	searchUrl: '/wp-content/plugins/ajax-search-for-woocommerce-premium/includes/Engines/TNTSearchMySQL/Endpoints/search.php',
	currency: '₹',
	pages: {}
}

class PageClass extends Store {
	constructor( initialState ) {
		super( initialState )
		this.promises = {}
	}

	getOrFetch( path ) {
		const state = this.get()

		if ( state.pages[path] || import.meta.env.SSR ) {
			return state.pages[path] || {}
		}

		if ( this.promises[path] ) {
			throw this.promises[path]
		}

		const promise = fetchPageData( path ).then( ( data ) => {
			if ( data && data.ssd && data.ssd.pages && data.ssd.pages[path] ) {
				if ( typeof window !== 'undefined' && window.dcSSD ) {
					if (!window.dcSSD.pages) window.dcSSD.pages = {}
					window.dcSSD.pages[path] = data.ssd.pages[path]
				}
				this.set( ( old ) => ( {
					...old,
					pages: { ...old.pages, [path]: data.ssd.pages[path] }
				} ) )
			} else {
				this.set( ( old ) => ( {
					...old,
					pages: { ...old.pages, [path]: {} }
				} ) )
			}
			delete this.promises[path]
		} )

		this.promises[path] = promise
		throw promise
	}
}

const PageStore = new PageClass( initialState )

function usePageData( path ) {
	const cleanPath = getCleanPath( path )
	useStore( PageStore )
	return PageStore.getOrFetch( '' === cleanPath ? 'home' : cleanPath )
}

export { PageStore, usePageData, useStore }
