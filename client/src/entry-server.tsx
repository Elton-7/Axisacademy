import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { HelmetProvider, type FilledContext } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { toasterProps } from './toaster'

/**
 * Build-time rendering entry point (see scripts/prerender.mjs).
 *
 * Data-fetching happens in effects, which do not run during renderToString, so
 * API-driven pages emit their loading state here. That is intentional and safe:
 * the initial client render before effects run is identical, so hydration
 * matches. What this buys us is real <head> content — titles, descriptions,
 * canonicals, Open Graph and structured data — in the served HTML, which is what
 * social scrapers read and what they could not see before.
 */
export function render(url: string) {
  const helmetContext = {} as FilledContext

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
        <Toaster {...toasterProps} />
      </StaticRouter>
    </HelmetProvider>
  )

  const { helmet } = helmetContext

  const head = [
    helmet?.title?.toString(),
    helmet?.meta?.toString(),
    helmet?.link?.toString(),
    helmet?.script?.toString(),
  ]
    .filter(Boolean)
    .join('\n    ')

  return { html, head }
}
