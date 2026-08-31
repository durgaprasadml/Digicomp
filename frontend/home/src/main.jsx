import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterRoot } from "@typeroute/router"
import * as routes from './routes.js'
import './index.css'

createRoot(document.getElementById('dc-app')).render(
  <StrictMode>
    <RouterRoot routes={ routes } />
  </StrictMode>,
)
