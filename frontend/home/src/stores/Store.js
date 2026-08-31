import { useRef, useSyncExternalStore } from 'react'

export class Store {
	constructor( initialState, name = '' ) {
		this.name = name
		this.initialState = initialState
		this._state = initialState
		this._listeners = new Set()
	}

	get() {
		return this._state
	}

	_notify() {
		for (const listener of this._listeners) {
			listener()
		}
	}

	set( updater, info ) {
		const nextState = { ...this._state, ...updater( this._state ) }

		this._state = this.condition
			? this.condition(nextState, info) ?? this._state
			: nextState;

		this._notify()
	}

	replace( updater, info ) {
		const nextState = updater( this._state )

		this._state = this.condition
			? this.condition( nextState, info ) ?? this._state
			: nextState;

		this._notify()
	}

	setCondition( condition ) {
		this.condition = condition
	}

	reset() {
		this._state = this.initialState
		this._notify()
	}

	subscribe( listener ) {
		this._listeners.add( listener )
		return () => this._listeners.delete( listener )
	}

	unsubscribe( listener ) {
		this._listeners.delete( listener )
	}

	overrideInitialState( state ) {
		this._state = state
		this.initialState = state
		this._notify()
	}

	use() {
		return useStore( this )
	}
}

export function useStore( store ) {
	return useSyncExternalStore(
		store.subscribe.bind( store ),
		store.get.bind( store ),
		store.get.bind( store )
	)
}

export function useStores( stores ) {
	const cache = useRef()

	const getSnapshot = () => {
		const values = stores.map( store => store.get() )
		const cached = cache.current

		if ( cached && cached.length === values.length && cached.every( ( value, i ) => value === values[i] ) ) {
			return cached
		}

		cache.current = values
		return values
	};

	return useSyncExternalStore( listener => {
		const unsubscribes = stores.map( store => store.subscribe( listener ) )

		return () => {
			for ( const unsubscribe of unsubscribes ) {
				unsubscribe()
			}
		}
	}, getSnapshot, getSnapshot )
}
