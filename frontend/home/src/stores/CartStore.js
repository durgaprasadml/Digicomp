import { Store, useStore } from './Store'
import { UserStore } from './UserStore'

import { postToCart } from '../services/api'
import { getStorageJSON, setStorage } from '../services/helper'

const initialCart = {
	items: [],
	count: 0,
	lineCount: 0,
	url: '/cart',
};

class CartClass extends Store {
	constructor ( ...params ) {
		super( ...params )
		// When UserStore updates, Update cart store // Todo: avoid duplication?
		UserStore.subscribe( this.setCart.bind( this ) )
		// When CartStore updates, update localStorage
		this.subscribe( this.updateLocal.bind( this ) )
	}

	setCart() {
		const { cart } = UserStore.get()
		this.set( () => ( { cart } ) )
	}

	updateLocal() {
		setStorage( 'digicomp-cart', this.get().cart )
	}

	async addToCart (id, qty = 1) {
		this.set( ( { cart } ) => {
			// Ensure we have a valid items array to work with
			const currentItems = cart.items || []
			const existingItemIndex = currentItems.findIndex( item => item.id === id )

			let newItems = [...currentItems]

			if (existingItemIndex >= 0) {
				// Item exists, update its quantity
				newItems[existingItemIndex] = {
					...newItems[existingItemIndex],
					qty: newItems[existingItemIndex].qty + qty
				}
			} else {
				// New item, add it to the array
				newItems.push( { id, qty } )
			}

			// Recalculate totals
			const newCount = newItems.reduce( ( total, item ) => total + item.qty, 0 )
			const newLineCount = newItems.length

			return { cart: {
				items: newItems,
				count: newCount,
				lineCount: newLineCount,
				url: '/cart',
			} }
		})
		return await postToCart( id, qty )
	}

	setRef( cartRef ) {
		this.set( () => ( { cartRef } ) )
	}
}

const CartStore = new CartClass( { cart: getStorageJSON( 'digicomp-cart', initialCart ), cartRef: null } )

export { CartStore, useStore }
