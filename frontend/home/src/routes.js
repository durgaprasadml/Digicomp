import { lazy } from 'react'
import { route } from "@typeroute/router"

export const home = route( '/' ).component( lazy( () => import( './pages/Home' ) ) )
export const shop = route( '/shop' ).component( lazy( () => import( './pages/Shop' ) ) )
