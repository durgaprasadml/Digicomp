import { lazy } from 'react'
import { route } from "@typeroute/router"
import App from './App'

const app = route( '/' ).component( App )

export const home = app.component( lazy( () => import( './pages/Home' ) ) )
export const shop = app.route( '/shop' ).component( lazy( () => import( './pages/Shop' ) ) )
export const category = app.route( '/product-category/:slug' ).component( lazy( () => import( './pages/Shop' ) ) )
export const tag = app.route( '/product-tag/:tag' ).component( lazy( () => import( './pages/Shop' ) ) )
export const brand = app.route( '/brand/:brand' ).component( lazy( () => import( './pages/Shop' ) ) )
export const product = app.route( '/product/:slug' ).component( lazy( () => import( './pages/Product' ) ) )
