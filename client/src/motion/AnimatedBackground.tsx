/**
 * The drifting gold wash from the hero, made available to any section.
 *
 * The hero already builds this by hand out of two radial gradients and the
 * `drift` keyframes in the Tailwind config. This is the same effect as a
 * component, so the pattern can be reused without that block being copied — and
 * copied slightly differently — into every section that wants it.
 *
 * Three deliberate choices:
 *
 *   `aria-hidden` and `pointer-events-none`. It is decoration, and it sits
 *   underneath content that has to stay clickable.
 *
 *   `motion-safe:` on the animation rather than a JavaScript check. The class
 *   is compiled into the stylesheet, so a visitor who asked for reduced motion
 *   gets a still gradient with no script involved at all.
 *
 *   Very low opacity. Behind body text this has to stay a suggestion of colour;
 *   anything stronger starts eating the contrast the text needs.
 */
type Props = {
  /** `soft` sits behind text. `bold` is for a hero or a call to action. */
  intensity?: 'soft' | 'bold'
  /** Adds a fine dot grid over the gradients. */
  grid?: boolean
  className?: string
}

export default function AnimatedBackground({ intensity = 'soft', grid = false, className = '' }: Props) {
  const strong = intensity === 'bold'

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className={`absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full motion-safe:animate-drift ${
          strong ? 'opacity-40' : 'opacity-20'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0) 70%)',
        }}
      />
      <div
        className={`absolute -bottom-40 -right-28 h-[30rem] w-[30rem] rounded-full motion-safe:animate-drift-alt ${
          strong ? 'opacity-40' : 'opacity-20'
        }`}
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)',
        }}
      />
      {grid && <div className="absolute inset-0 opacity-[0.06] motion-safe:animate-breathe axis-dot-grid" />}
    </div>
  )
}
