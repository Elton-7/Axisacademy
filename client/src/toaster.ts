import type { ToasterProps } from 'react-hot-toast'

/**
 * Shared so the browser entry and the prerender entry render an identical tree.
 * If these diverge, hydration mismatches at the root and React throws away the
 * prerendered markup.
 */
export const toasterProps: ToasterProps = {
  position: 'top-right',
  toastOptions: {
    duration: 4000,
    style: {
      background: '#0a1628',
      color: '#fff',
      border: '1px solid #c9a84c',
    },
  },
}
