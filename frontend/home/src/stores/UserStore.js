import { Store, useStore } from './Store'

import { fetchUserData } from '../utils/api'

class UserClass extends Store {
	constructor( initialState ) {
		super( initialState )
		this.initPromise = null
	}

	ensureData() {
		// If already initialized with nonce, return resolved state
		if ( this.get().nonce && this.get().isInitialized ) return Promise.resolve( this.get() )

		if ( !this.initPromise ) {
			this.initPromise = fetchUserData().then( ( ud ) => {
				this.set( () => ( { ...ud, isInitialized: true } ) )
				return { ...ud, isInitialized: true }
			} ).catch( () => {
				this.set( () => ( { isInitialized: true } ) )
				return this.get()
			} )
		}
		return this.initPromise
	}

	refreshData() {
		this.initPromise = null
		this.set( () => ( { nonce: '' } ) ) // clear nonce to force fetch
		return this.ensureData()
	}
}

const UserStore = new UserClass( {
	isInitialized: false,
	nonce: '',
	wpNonce: '',
	cart: {
		items: [],
		count: 0,
		lineCount: 0,
		url: '/cart',
	},
	user: { is_logged_in: false },
	wishlists: [],
} )

export { UserStore, useStore }

