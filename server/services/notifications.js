const nodemailer = require('nodemailer')

/**
 * Enquiry notifications (brief §26, §43).
 *
 * The funnel only works if someone at Axis knows an enquiry arrived. Without
 * SMTP configured this logs instead of sending, so development and tests never
 * depend on a mail server and a missing credential can never silently drop a
 * lead without leaving a trace.
 *
 * Delivery is deliberately non-blocking: a mail outage must never cause a
 * parent's enquiry to fail. Failures are logged, and the enquiry is already
 * persisted by the time we get here.
 */

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_SECURE,
  NOTIFICATION_FROM,
  NOTIFICATION_TO,
  SITE_URL,
} = process.env

const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASSWORD && NOTIFICATION_TO)

let transporter = null

function getTransporter() {
  if (!isConfigured) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  }
  return transporter
}

/** Values come from a public form, so never interpolate them into HTML. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Subjects are built from public form input and land in a mail header, so
 * newlines are stripped and the length capped. Nodemailer guards against header
 * injection itself; this keeps the value sane before it gets there.
 */
function headerSafe(value, maxLength = 120) {
  const text = String(value ?? '').replace(/[\r\n]+/g, ' ').trim()
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text
}

function renderRows(fields) {
  return fields
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#55637d;vertical-align:top">${escapeHtml(label)}</td>` +
        `<td style="padding:6px 0;color:#0a1628">${escapeHtml(value)}</td></tr>`
    )
    .join('')
}

async function send({ subject, heading, fields, footer }) {
  const mailer = getTransporter()

  if (!mailer) {
    console.info(`[notifications] SMTP not configured — would have sent: ${subject}`)
    return { sent: false, reason: 'not-configured' }
  }

  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:640px">
      <h2 style="color:#0a1628;margin:0 0 4px">${escapeHtml(heading)}</h2>
      <p style="color:#55637d;margin:0 0 20px">${escapeHtml(footer || '')}</p>
      <table style="border-collapse:collapse;width:100%">${renderRows(fields)}</table>
    </div>
  `

  try {
    await mailer.sendMail({
      from: NOTIFICATION_FROM || SMTP_USER,
      to: NOTIFICATION_TO,
      subject,
      html,
      text: fields.map(([label, value]) => `${label}: ${value ?? ''}`).join('\n'),
    })
    return { sent: true }
  } catch (error) {
    // Never surface this to the person who submitted the form.
    console.error('[notifications] Failed to send:', error.message)
    return { sent: false, reason: 'send-failed' }
  }
}

function notifyNewEnquiry(enrollment) {
  const adminUrl = SITE_URL ? `${SITE_URL.replace(/\/$/, '')}/admin` : 'the Axis admin dashboard'
  const isConsultation = enrollment.requestType === 'consultation'

  // A consultation request is time-sensitive in a way a general enquiry is not:
  // the family has said when they are free, so the subject line says so.
  const who = enrollment.studentName || enrollment.parentName || 'a family'

  return send({
    subject: headerSafe(
      isConsultation
        ? `Consultation request: ${who}${enrollment.preferredDays ? ` — prefers ${enrollment.preferredDays}` : ''}`
        : `New enquiry: ${who}${enrollment.programme ? ` — ${enrollment.programme}` : ''}`
    ),
    heading: isConsultation ? 'New consultation request' : 'New learner enquiry',
    footer: isConsultation
      ? `Confirm a time with this family, then mark the enquiry as Consultation Booked in ${adminUrl}.`
      : `Open ${adminUrl} to respond and move this enquiry through the pipeline.`,
    fields: [
      ['Request', isConsultation ? 'Consultation' : 'Enquiry'],
      ['Preferred contact', enrollment.preferredChannel],
      ['Learner', enrollment.studentName],
      ['Parent or guardian', enrollment.parentName],
      ['Email', enrollment.email],
      ['Phone', enrollment.phone],
      ['Learner age', enrollment.learnerAge],
      ['Age group', enrollment.ageGroup],
      ['Location', enrollment.location],
      ['Programme', enrollment.programme],
      ['Current school', enrollment.currentSchool],
      ['Current curriculum', enrollment.curriculum],
      ['Grade or class', enrollment.gradeClass],
      ['Subjects', enrollment.subjects],
      ['Preferred learning model', enrollment.preferredLearningModel],
      ['Preferred days', enrollment.preferredDays],
      ['Preferred times', enrollment.preferredTimes],
      ['Learning needs', enrollment.learningNeeds],
      ['Additional information', enrollment.notes],
    ],
  })
}

function notifyNewContact(contact) {
  return send({
    subject: headerSafe(`New message: ${contact.subject || 'website enquiry'}`),
    heading: 'New website message',
    footer: 'Sent from the Axis Learning contact form.',
    fields: [
      ['Name', contact.name],
      ['Email', contact.email],
      ['Phone', contact.phone],
      ['Subject', contact.subject],
      ['Message', contact.message],
    ],
  })
}

module.exports = { notifyNewEnquiry, notifyNewContact, isConfigured }
