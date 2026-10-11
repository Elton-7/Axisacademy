/**
 * An accordion that animates its height, and behaves like a disclosure while
 * doing it.
 *
 * The FAQ page has its own accordion already and this does not replace it. This
 * is the reusable one — for the fee notes, the policy pages, the programme
 * detail — so that the next one does not get written from scratch a fourth
 * time with a different set of keyboard behaviours.
 *
 * The details that are usually wrong:
 *
 *   It is a `button`, so Enter and Space work, focus is visible, and it appears
 *   in a screen reader's list of controls. A `div` with an onClick is none of
 *   those things.
 *
 *   `aria-expanded` on the trigger and `aria-controls` pointing at the panel,
 *   so the state is announced rather than merely drawn.
 *
 *   The panel is `hidden` when closed, not merely zero-height. A collapsed
 *   panel that is still in the accessibility tree gets read aloud, and its
 *   links stay in the tab order — the visitor tabs into content they cannot
 *   see. Framer's exit animation runs before it is removed, so this costs
 *   nothing visually.
 *
 *   `height: auto` is animated via framer's layout support rather than by
 *   measuring, so content that reflows — a long answer on a narrow phone —
 *   does not end up clipped at a height measured for a wider screen.
 */
import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { usePrefersReducedMotion } from './preferences'

export type AccordionItem = {
  question: string
  answer: ReactNode
}

type Props = {
  items: AccordionItem[]
  /** Open one at a time. Off by default: comparing two answers is common. */
  single?: boolean
  className?: string
}

export default function Accordion({ items, single = false, className = '' }: Props) {
  const [open, setOpen] = useState<number[]>([])
  const reduced = usePrefersReducedMotion()
  const baseId = useId()

  const toggle = (index: number) => {
    setOpen((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index)
      return single ? [index] : [...current, index]
    })
  }

  return (
    <div className={`divide-y divide-line rounded-2xl border border-line bg-surface ${className}`}>
      {items.map((item, index) => {
        const isOpen = open.includes(index)
        const panelId = `${baseId}-panel-${index}`
        const triggerId = `${baseId}-trigger-${index}`

        return (
          <div key={item.question}>
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-surface-muted"
            >
              <span className="text-base font-semibold text-ink">{item.question}</span>
              <motion.span
                aria-hidden="true"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
                className="flex flex-shrink-0 text-gold-700"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  key="panel"
                  initial={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={reduced ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.26, ease: [0.16, 1, 0.3, 1] }}
                  // Clipped during the height animation only; released
                  // afterwards so a focus ring inside is never cut off.
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-sm leading-relaxed text-ink-muted">{item.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
