import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, resolveTheme, type Theme } from '../theme'

/**
 * The theme is already applied by the inline script in index.html, so this only
 * mirrors it and lets the visitor change it.
 *
 * It renders nothing until mounted: the prerendered HTML has no way to know
 * which theme the browser will resolve to, and rendering a guess would show the
 * wrong icon for a moment on every load.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(resolveTheme())
  }, [])

  if (theme === null) {
    // Reserve the space so the navbar does not shift when it appears.
    return <span className={`inline-block h-9 w-9 ${className}`} aria-hidden="true" />
  }

  const next = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/40 text-gold-500 transition-colors hover:bg-gold-500 hover:text-navy-surface ${className}`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
