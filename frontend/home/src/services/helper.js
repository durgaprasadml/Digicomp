export const getCleanPath = str =>
	str.replace( /^\//, '' ) // Remove leading slash
		.replace( /[?#].*$/, '' ) // Remove query/hash
		.replace( /\/+$/, ''); // Remove trailing slash

export function getStorageJSON( key, defaultValue = null ) {
	if ( typeof window !== 'undefined' && typeof localStorage !== 'undefined' ) {
		try {
			const item = localStorage.getItem( key )
			if ( item ) {
				return JSON.parse( item )
			}
		} catch ( e ) {
			console.warn( `Error parsing localStorage key "${ key }":`, e )
		}
	}
	return defaultValue
}

export function getStorageString( key, defaultValue = '' ) {
	if ( typeof window !== 'undefined' && typeof localStorage !== 'undefined' ) {
		try {
			return localStorage.getItem( key ) || defaultValue
		} catch ( e ) {
			console.warn( `Error reading localStorage key "${ key }":`, e )
		}
	}
	return defaultValue
}

export function setStorage( key, value ) {
	if ( typeof window !== 'undefined' && typeof localStorage !== 'undefined' ) {
		try {
			const stringValue = typeof value === 'string' ? value : JSON.stringify( value )
			localStorage.setItem( key, stringValue )
		} catch ( e ) {
			console.warn( `Error setting localStorage key "${ key }":`, e )
		}
	}
}
