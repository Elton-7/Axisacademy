/**
 * The ways in to the signed-in areas that a visitor is offered.
 *
 * Kept here because both the header and the footer list them, and a private
 * copy in each is how they drift apart — the social links were duplicated
 * exactly that way and the shared list went unread.
 *
 * The staff panel is deliberately not in this list any more.
 *
 * It used to be, on the reasoning that leaving it unlinked hid the panel from
 * Axis without hiding it from anyone else — the API refuses unauthorised
 * requests, so the link costs nothing. That reasoning still holds on its own
 * terms, and removing the link is not what protects the panel: /admin is
 * behind an Apache password as well as its own sign-in, and that is the
 * control. What the link cost was relevance. Every parent reading this site
 * was shown a staff entrance they can never use, on every page.
 *
 * Staff reach it at /admin directly. It is recorded in docs/DEPLOYMENT.md so
 * the address does not live only in somebody's browser history.
 */
export const portalLinks = [
  {
    href: '/portal/student',
    label: 'Parent & Learner Portal',
    description: 'Attendance, progress and messages for your child.',
  },
  {
    href: '/portal/tutor',
    label: 'Educator Portal',
    description: 'Mark attendance and record sessions and assessments.',
  },
] as const
