import { renderToString } from 'react-dom/server'
import { MemoryHistory, Router } from '@typeroute/router'
import * as routes from './routes-ssr'

import App from './App'

export function render(url) {
  const history = new MemoryHistory( url )
  const router = new Router( { routes, history } )

  const html = renderToString(
    <App routerProps={ { router } } />
  )

  return html
}
