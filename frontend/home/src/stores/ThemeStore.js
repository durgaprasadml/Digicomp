import { Store, useStore } from './Store'

import { getStorageString, setStorage } from '../utils/helper'

class ThemeClass extends Store {
	constructor ( ...params ) {
		super( ...params )
		// Set root attribute from local
		this.updateDOM( this.get().theme )
		// When ThemeStore updates, update DOM and localStorage
		this.subscribe( this.updateLocal.bind( this ) )
	}

	updateDOM() {
		if ( typeof document !== 'undefined' && document.documentElement ) {
			document.documentElement.setAttribute( 'data-theme', this.get().theme )
		}
	}

	updateLocal() {
		this.updateDOM( this.get().theme )
		setStorage( 'digicomp-theme', this.get().theme )
	}

	toggleTheme() {
		this.set( ( { theme } ) => ( { theme: 'dark' === theme  ? 'light' : 'dark' } ) )
	}
}

const ThemeStore = new ThemeClass( { theme: getStorageString('digicomp-theme', 'dark') } )

export { ThemeStore, useStore }
