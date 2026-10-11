/**
 * Motion and interaction, in one place.
 *
 * Everything here is additive. No existing component was rewritten to make any
 * of it work: the global pieces are mounted once in Layout, and the rest are
 * wrappers a page opts into around markup it already has.
 *
 * Every one of them can be removed by deleting a line, which is the property
 * that matters most — decoration should never be load-bearing.
 */
export { default as ScrollProgressBar } from './ScrollProgressBar'
export { default as CustomCursor } from './CustomCursor'
export { default as PageTransition } from './PageTransition'
export { default as NavbarAutoHide } from './NavbarAutoHide'
export { default as FloatingContact } from './FloatingContact'
export { default as Reveal } from './Reveal'
export { default as TextReveal } from './TextReveal'
export { default as MagneticButton } from './MagneticButton'
export { default as Parallax } from './Parallax'
export { default as AnimatedBackground } from './AnimatedBackground'
export { default as Accordion, type AccordionItem } from './Accordion'
export { LoadingScreen, Skeleton, SkeletonText } from './LoadingScreen'
export { usePrefersReducedMotion, useHasFinePointer, useMounted, useCanAnimate } from './preferences'
export { useScrollDirection } from './useScrollDirection'
