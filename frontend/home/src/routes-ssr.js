import { route } from '@typeroute/router'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Post from './pages/Post'
import MyAccount from './pages/MyAccount'

// Server-side routes statically import components to avoid Suspense fallbacks during SSR
export const home = route( '/' ).component( Home )
export const shop = route( '/shop' ).component( Shop )
export const category = route( '/product-category/:cat' ).component( Shop )
export const tag = route( '/product-tag/:tag' ).component( Shop )
export const brand = route( '/brand/:brand' ).component( Shop )
export const product = route( '/product/:slug' ).component( Product )
export const cart = route( '/cart' ).component( Cart )
export const checkout = route( '/checkout' ).component( Checkout )
export const post = route( '/blog/:slug' ).component( Post )
export const account = route( '/my-account' ).component( MyAccount )
export const accountTab = route( '/my-account/:tab' ).component( MyAccount )
export const viewOrder = route( '/my-account/view-order/:id' ).component( MyAccount )
export const page = route( '/:slug' ).component( Post )
