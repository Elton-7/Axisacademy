import { useEffect, useRef, useState } from 'react'
import { Loader2, MessagesSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { portalApi } from '../services/apiClient'
import type { PortalMessageItem } from '../types'

/**
 * The conversation about a learner (brief §28).
 *
 * One thread per learner rather than per pair of people, so a parent does not
 * have to work out who to write to and Axis can see the whole history in one
 * place. Who can read it is decided by the API.
 */

const roleLabel: Record<PortalMessageItem['senderRole'], string> = {
  student: 'Parent',
  tutor: 'Educator',
  staff: 'Axis',
  admin: 'Axis',
}

const formatWhen = (value: string) =>
  new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

export default function MessageThread({ learnerId }: { learnerId: number }) {
  const [messages, setMessages] = useState<PortalMessageItem[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    portalApi
      .getMessages(learnerId)
      .then((items) => {
        if (!cancelled) setMessages(items)
      })
      .catch((err) => {
        console.error('Failed to load the conversation:', err)
        if (!cancelled) setError('This conversation is unavailable right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [learnerId])

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [messages.length])

  const send = async () => {
    const body = draft.trim()
    if (!body) return

    try {
      setSending(true)
      const sent = await portalApi.sendMessage(learnerId, body)
      setMessages((prev) => [...prev, sent])
      setDraft('')
    } catch (err) {
      console.error('Failed to send the message:', err)
      toast.error('Could not send your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        <MessagesSquare className="h-4 w-4" /> Conversation
      </h4>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-gold-500" />
        </div>
      ) : error ? (
        <p className="rounded-lg border border-line-critical bg-tint-critical p-4 text-sm text-critical">{error}</p>
      ) : (
        <>
          <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-muted">
                No messages yet. Anything you write here is seen by Axis and by this learner’s
                educators.
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.isMine ? 'bg-navy-900 text-white' : 'bg-surface-muted text-ink'
                    }`}
                  >
                    {!message.isMine && (
                      <p className="mb-1 text-xs font-semibold text-ink-muted">
                        {message.senderName}
                        <span className="ml-2 font-normal text-ink-muted">
                          {roleLabel[message.senderRole]}
                        </span>
                      </p>
                    )}
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                    <p
                      className={`mt-1 text-[0.65rem] ${
                        message.isMine ? 'text-white/50' : 'text-ink-muted'
                      }`}
                    >
                      {formatWhen(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <div className="mt-4 flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                // Enter sends; Shift+Enter starts a new line.
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  send()
                }
              }}
              rows={2}
              maxLength={4000}
              placeholder="Write a message..."
              aria-label="Write a message"
              className="flex-1 resize-none rounded-lg border border-line px-4 py-2.5 text-sm outline-none focus:border-gold-500"
            />
            <button
              onClick={send}
              disabled={sending || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2.5 text-sm text-white transition-colors hover:bg-gold-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}
