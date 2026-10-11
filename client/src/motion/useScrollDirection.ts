/**
 * Which way the visitor is scrolling, and whether they have left the top.
 *
 * Used to let the header get out of the way going down and come back coming up.
 * Two details matter and both are about not being annoying:
 *
 *   A threshold, so a two-pixel wobble on a phone does not flap the header.
 *   A floor, so the header is never hidden near the top of the page, where
 *   hiding it buys no reading room and only looks broken.
 *
 * Reads are passive and batched into a frame. A scroll handler that touches
 * layout on every event is the classic way to make a cheap phone feel slow.
 */
import { useEffect, useState } from 'react'

type Direction = 'up' | 'down'

const THRESHOLD = 8
const FLOOR = 120

export function useScrollDirection() {
  const [direction, setDirection] = useState<Direction>('up')
  const [atTop, setAtTop] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let last = window.scrollY
    let frame = 0

    const read = () => {
      frame = 0
      const y = window.scrollY

      setAtTop(y < FLOOR)

      if (Math.abs(y - last) < THRESHOLD) return
      // Clamped: iOS rubber-banding reports negative offsets past the top, and
      // an over-scroll bounce should not count as scrolling up.
      setDirection(y > last && y > FLOOR ? 'down' : 'up')
      last = Math.max(y, 0)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { direction, atTop }
}
