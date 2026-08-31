import { Store, useStore } from './Store'

import { fetchUserData } from '../utils/api'

class UserClass extends Store {
	constructor( initialState ) {
		super( initialState )
		this.initPromise = null
	}

	ensureData() {
		// Todo: Only fetch userData if user intends to.
		if ( this.get().nonce ) return Promise.resolve( this.get() )

		if ( !this.initPromise ) {
			this.initPromise = fetchUserData().then( ( ud ) => {
				this.set( () => ( { ...ud } ) )
				return ud
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
