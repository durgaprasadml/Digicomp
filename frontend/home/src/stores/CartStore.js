import { Store, useStore } from './Store'
import { UserStore } from './UserStore'

import { addCartItem, updateCartItem, removeCartItem, fetchCart } from '../utils/api'
import { getStorageJSON, setStorage } from '../utils/helper'

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

	mapStoreCart(storeCart) {
		if (!storeCart || !storeCart.items) return null;

		const mappedCart = {
			items: storeCart.items.map(item => ({
				id: item.id,
				vid: item.id,
				key: item.key,
				qty: item.quantity,
				name: item.name,
				price: item.prices?.price ? (item.prices.price / (10 ** storeCart.totals.currency_minor_unit)).toString() : '',
				image: item.images?.[0]?.src || '',
				totals: item.totals
			})),
			count: storeCart.items_count,
			lineCount: storeCart.items.length,
			url: '/cart',
			storeApiData: storeCart
		};

		UserStore.set( ( state ) => ( { ...state, cart: mappedCart } ) );
		this.set( () => ( { cart: mappedCart } ) );
		return mappedCart;
	}

	async addToCart (id, qty = 1) {
		this.set( ( { cart } ) => {
			// Optimistic UI Update
			const currentItems = cart.items || []
			const existingItemIndex = currentItems.findIndex( item => item.id === id )

			let newItems = [...currentItems]

			if (existingItemIndex >= 0) {
				newItems[existingItemIndex] = {
					...newItems[existingItemIndex],
					qty: newItems[existingItemIndex].qty + qty
				}
			} else {
				newItems.push( { id, qty } )
			}

			const newCount = newItems.reduce( ( total, item ) => total + item.qty, 0 )
			const newLineCount = newItems.length

			return { cart: {
				...cart,
				items: newItems,
				count: newCount,
				lineCount: newLineCount,
			} }
		})

		// Call Store API
		const storeCart = await addCartItem( id, qty )
		this.mapStoreCart(storeCart)
		return storeCart
	}

	async updateCartItem(key, qty) {
		// Optimistic UI
		this.set( ( { cart } ) => {
			const currentItems = cart.items || []
			const existingItemIndex = currentItems.findIndex( item => item.key === key )
			if (existingItemIndex < 0) return { cart }

			let newItems = [...currentItems]
			newItems[existingItemIndex] = { ...newItems[existingItemIndex], qty }
			const newCount = newItems.reduce( ( total, item ) => total + item.qty, 0 )

			return { cart: { ...cart, items: newItems, count: newCount } }
		})

		const storeCart = await updateCartItem( key, qty )
		this.mapStoreCart(storeCart)
		return storeCart
	}

	async removeCartItem(key) {
		// Optimistic UI
		this.set( ( { cart } ) => {
			const newItems = (cart.items || []).filter( item => item.key !== key )
			const newCount = newItems.reduce( ( total, item ) => total + item.qty, 0 )
			return { cart: { ...cart, items: newItems, count: newCount, lineCount: newItems.length } }
		})

		const storeCart = await removeCartItem( key )
		this.mapStoreCart(storeCart)
		return storeCart
	}

	async fetchCart() {
		await UserStore.ensureData()
		const storeCart = await fetchCart()
		this.mapStoreCart(storeCart)
		return storeCart
	}

	setRef( cartRef ) {
		this.set( () => ( { cartRef } ) )
	}
}

const CartStore = new CartClass( { cart: getStorageJSON( 'digicomp-cart', initialCart ), cartRef: null } )

export { CartStore, useStore }
