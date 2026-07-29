import { Store, useStore } from './Store'
import { UserStore } from './UserStore'

import { addWishlistItem, removeWishlistItem, createWishlist, deleteWishlist, fetchWishLists, fetchWishlist } from '../utils/api'

const initialWishlists = [];

class WishlistClass extends Store {
	constructor ( ...params ) {
		super( ...params )
		// When UserStore updates, update wishlist store
		UserStore.subscribe( this.setWishlists.bind( this ) )
	}

	setWishlists() {
		const { wishlists } = UserStore.get()
		this.set( () => ( { wishlists } ) )
	}

	async addToWishlist (wishlistId, productId) {
		this.set( ( { wishlists } ) => {
			// Optimistic UI Update
			const currentLists = [...wishlists]
			const targetList = currentLists.find(l => l.id === wishlistId)
			if ( targetList && !targetList.items.includes(productId) ) {
				targetList.items.push(productId)
			}
			return { wishlists: currentLists }
		} )

		await UserStore.ensureData()
		return await addWishlistItem( wishlistId, productId )
	}

	async removeFromWishlist (wishlistId, productId) {
		this.set( ( { wishlists } ) => {
			// Optimistic UI Update
			const currentLists = [...wishlists]
			const targetList = currentLists.find(l => l.id === wishlistId)
			if ( targetList ) {
				targetList.items = targetList.items.filter(id => id !== productId)
			}
			return { wishlists: currentLists }
		} )

		await UserStore.ensureData()
		return await removeWishlistItem( wishlistId, productId )
	}

	async createList(name) {
		const res = await createWishlist(name)
		this.set( ( { wishlists } ) => {
			return { wishlists: [...wishlists, { id: res.id, name, items: [] }] }
		} )
		return res
	}

	async deleteList(id) {
		// Optimistic UI Update
		this.set( ( { wishlists } ) => {
			return { wishlists: wishlists.filter(l => l.id !== id) }
		} )
		return await deleteWishlist(id)
	}

	async fetchWishlist(id) {
		await UserStore.ensureData()
		return await fetchWishlist(id)
	}

	setRef( wishlistRef ) {
		this.set( () => ( { wishlistRef } ) )
	}
}

// Global state using closure
const globalState = new WishlistClass( { wishlists: initialWishlists, wishlistRef: null } );
export const WishlistStore = globalState;
