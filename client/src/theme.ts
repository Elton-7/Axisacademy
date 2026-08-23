export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'axis_theme'

/**
 * Theme handling (client-side only).
 *
 * The document class is set by an inline script in index.html before first
 * paint, so this module never has to apply the theme on mount — doing that in
 * React would show a flash of the wrong colours on every load, which is worse
 * on a slow connection than no dark mode at all.
 */

export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    // Private browsing can throw on localStorage access.
    return null
  }
}

export function getSystemTheme(): Theme {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/** An explicit choice wins; otherwise follow the operating system. */
export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not being able to remember the choice is survivable.
  }
}
