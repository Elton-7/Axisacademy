/**
 * The three ways in to the signed-in areas.
 *
 * Kept here because both the header and the footer list them, and a private
 * copy in each is how they drift apart — the social links were duplicated
 * exactly that way and the shared list went unread.
 *
 * All three are listed, the staff one included. Leaving it unlinked hid the
 * panel from Axis without hiding it from anyone else: it is protected by the
 * API refusing unauthorised requests, not by the absence of a link.
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
  {
    href: '/admin/login',
    label: 'Staff Login',
    description: 'Axis administration and site content.',
  },
] as const
