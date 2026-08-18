import type { CreateContactRequest } from '../types'

export function stripTags(input: string | undefined | null): string {
  if (!input) return ''
  // Remove any HTML tags and trim whitespace
  return input.replace(/<[^>]*>/g, '').trim()
}

export function sanitizeContactPayload(payload: CreateContactRequest): CreateContactRequest {
  return {
    name: stripTags(payload.name),
    email: stripTags(payload.email),
    phone: stripTags(payload.phone),
    subject: stripTags(payload.subject),
    message: stripTags(payload.message),
    programme: stripTags(payload.programme),
  }
}
