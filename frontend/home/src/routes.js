import { route } from "@typeroute/router"
import App from './App'

const app = route( '/' ).component( App )

export const home = app.lazy( () => import( './pages/Home' ) )
export const shop = app.route( '/shop' ).lazy( () => import( './pages/Shop' ) )
export const category = app.route( '/product-category/:cat' ).lazy( () => import( './pages/Shop' ) )
export const tag = app.route( '/product-tag/:tag' ).lazy( () => import( './pages/Shop' ) )
export const brand = app.route( '/brand/:brand' ).lazy( () => import( './pages/Shop' ) )
export const product = app.route( '/product/:slug' ).lazy( () => import( './pages/Product' ) )
export const cart = app.route( '/cart' ).lazy( () => import( './pages/Cart' ) )
export const checkout = app.route( '/checkout' ).lazy( () => import( './pages/Checkout' ) )
export const post = app.route( '/blog/:slug' ).lazy( () => import( './pages/Post' ) )
export const account = app.route( '/my-account' ).lazy( () => import( './pages/MyAccount' ) ).lazy( () => import( './pages/MyAccount/Tabs' ) )
export const accountTab = account.route( '/:tab' ).lazy( () => import( './pages/MyAccount/Tabs' ) )
export const viewOrder = account.route( '/view-order/:id' ).lazy( () => import( './pages/MyAccount/Tabs' ) )
export const wishlist = app.route( '/wishlist' ).lazy( () => import( './pages/Wishlist' ) )
export const wishlistView = app.route( '/wishlist/:id' ).lazy( () => import( './pages/Wishlist/View' ) )
export const page = app.route( '/:slug' ).lazy( () => import( './pages/Post' ) )
