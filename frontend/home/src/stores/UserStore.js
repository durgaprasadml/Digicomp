import { Store, useStore } from './Store'

import { fetchUserData } from '../utils/api'

class UserClass extends Store {
	async fetchData() {
		// Todo: Only fetch userData if user intends to.
		const ud = await fetchUserData()
		this.set( () => ( { ...ud } ) )
	}
}

const UserStore = new UserClass( { nonce: '', wpNonce: '', cart: {
	items: [],
	count: 0,
	lineCount: 0,
	url: '/cart',
}, user: { is_logged_in: false }, payment_methods: [] } )

export { UserStore, useStore }
