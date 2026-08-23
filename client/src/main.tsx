import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import { toasterProps } from './toaster'
import './index.css'

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
