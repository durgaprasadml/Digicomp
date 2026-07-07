import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import * as routes from './routes.js'

createRoot(document.getElementById('dc-app')).render(
  <StrictMode>
    <App routerProps={{ routes }} />
  </StrictMode>,
)
