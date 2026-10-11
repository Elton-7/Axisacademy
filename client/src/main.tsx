import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { toasterProps } from './toaster'
import './index.css'
import { registerServiceWorker } from './pwa'

const container = document.getElementById('root')!

// Prerendered pages arrive with markup already in place, so hydrate those and
// mount fresh only when the container is empty (dev server, or a route that was
// not prerendered).
const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster {...toasterProps} />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

// Hydrate only when the markup in the page was prerendered for this exact route.
// Any other case — the dev server, or a non-prerendered route served the
// fallback shell — mounts fresh, so React never hydrates mismatched markup.
const prerenderedPath = container.dataset.prerenderedPath

if (prerenderedPath && prerenderedPath === window.location.pathname) {
  ReactDOM.hydrateRoot(container, app)
} else {
  container.innerHTML = ''
  ReactDOM.createRoot(container).render(app)
}

// Registered after the app is mounted and, inside, after the load event: the
// worker's install downloads the shell, and doing that while the page is still
// painting competes with the visitor for the same connection.
registerServiceWorker()
