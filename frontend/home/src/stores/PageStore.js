import { use } from 'react'
import { Store, useStore } from './Store'
import { UserStore } from './UserStore'
import { fetchPageData } from '../utils/api'
import { getCleanPath } from '../utils/helper'

const initialState = globalThis.window?.dcSSD || {
	homeUrl: '/',
	dcApiUrl: '/wp-json/dc/v1/',
	stApiUrl: '/wp-json/wc/store/v1/',
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

	fetch( path, options = {} ) {
		const cleanPath = getCleanPath( path )

		if ( this.promises[cleanPath] ) {
			return this.promises[cleanPath]
		}

		const doFetch = async () => {
			if ( options.waitNonce ) {
				await UserStore.ensureData()
			}

			const data = await fetchPageData( cleanPath )

			if ( data && data.ssd && data.ssd.pages && data.ssd.pages[cleanPath] ) {
				if ( typeof window !== 'undefined' && window.dcSSD ) {
					if (!window.dcSSD.pages) window.dcSSD.pages = {}
					window.dcSSD.pages[cleanPath] = data.ssd.pages[cleanPath]
				}
				this.set( ( old ) => ( {
					...old,
					pages: { ...old.pages, [cleanPath]: data.ssd.pages[cleanPath] }
				} ) )
			} else {
				this.set( ( old ) => ( {
					...old,
					pages: { ...old.pages, [cleanPath]: {} }
				} ) )
			}
			delete this.promises[cleanPath]
			return data?.ssd?.pages?.[cleanPath] || {}
		}

		const promise = doFetch()
		this.promises[cleanPath] = promise
		return promise
	}
}

const PageStore = new PageClass( initialState )

function usePageData( path ) {
	let cleanPath = getCleanPath( path )
	if ( cleanPath === '' ) cleanPath = 'home'

	useStore( PageStore )

	const state = PageStore.get()
	const existingData = state.pages[cleanPath]

	if ( existingData || import.meta.env.SSR ) {
		return existingData || {}
	}

	return use( PageStore.fetch( cleanPath ) )
}

export { PageStore, usePageData, useStore }
