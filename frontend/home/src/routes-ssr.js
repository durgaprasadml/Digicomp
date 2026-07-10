import { route } from '@typeroute/router'
import Home from './pages/Home'
import Shop from './pages/Shop'

// Server-side routes statically import components to avoid Suspense fallbacks during SSR
export const home = route( '/' ).component( Home )
export const shop = route( '/shop' ).component( Shop )
export const category = route( '/product-category/:slug' ).component( Shop )
export const tag = route( '/product-tag/:tag' ).component( Shop )
export const brand = route( '/brand/:brand' ).component( Shop )
