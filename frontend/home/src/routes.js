import { lazy } from 'react'
import { route } from "@typeroute/router"
import App from './App'

const app = route( '/' ).component( App )

export const home = app.component( lazy( () => import( './pages/Home' ) ) )
export const shop = app.route( '/shop' ).component( lazy( () => import( './pages/Shop' ) ) )
