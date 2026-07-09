import { renderToString } from 'react-dom/server'
import { MemoryHistory, Router, RouterRoot } from '@typeroute/router'
import * as routes from './routes-ssr'

export function render(url) {
  const history = new MemoryHistory( url )

  const html = renderToString(
    <RouterRoot routes={ routes } history={history} />
  )

  return html
}
