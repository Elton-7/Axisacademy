import { AxiosError } from 'axios'

interface ErrorBody {
  error?: string
  message?: string
  errors?: Array<{ field?: string; message?: string; msg?: string }>
}

/**
 * The message the server actually sent, or the fallback.
 *
 * Validation failures are only worth having if the person filling the form can
 * read them. Every admin save used to report a fixed "Failed to save X", so a
 * rejected field — a title over its limit, a category outside the allowed set —
 * arrived as an unexplained failure with nothing to act on.
 *
 * `msg` is read as well as `message` because express-validator's own array uses
 * that key, and a response may still come from a route not yet migrated.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const body = (error as AxiosError<ErrorBody>)?.response?.data
  if (!body) return fallback

  const detail = body.errors?.[0]
  return body.error || detail?.message || detail?.msg || body.message || fallback
}
