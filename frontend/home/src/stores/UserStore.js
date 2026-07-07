import { Store, useStore } from './Store'

import { fetchUserData } from '../services/api'

class UserClass extends Store {
	async fetchData() {
		// Todo: Only fetch userData if user intends to.
		const ud = await fetchUserData()
		this.set( () => ( { ...ud } ) )
	}
}

const UserStore = new UserClass( { nonce: '', cart: {
	items: [],
	count: 0,
	lineCount: 0,
	url: '/cart',
} } )

export { UserStore, useStore }
