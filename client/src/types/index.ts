// API Response Types

export interface Service {
  id: number
  title: string
  slug: string
  icon: string
  description: string
  items: string[]
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Testimonial {
  id: number
  text: string
  author: string
  role: string
  rating: number
  /** Whether someone has confirmed consent to publish this quote. */
  consentConfirmed: boolean
  /** The user who confirmed it, and when — cleared if consent is withdrawn. */
  consentConfirmedBy: number | null
  consentConfirmedAt: string | null
  /** The signed consent this refers to. */
  consentReference: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: number
  studentName: string
  parentName?: string
  email: string
  phone?: string
  programme: string
  ageGroup: 'child' | 'teenager' | 'adult'
  learnerAge?: number
  location?: string
  currentSchool?: string
  curriculum?: string
  gradeClass?: string
  subjects?: string
  learningNeeds?: string
  preferredLearningModel?: 'online' | 'home-based' | 'centre-based' | 'blended' | 'not-sure'
  preferredDays?: string
  preferredTimes?: string
  contactConsent: boolean
  notes?: string
  status: 'pending' | 'approved' | 'rejected' | 'waitlist'
  requestType: 'enquiry' | 'consultation'
  preferredChannel?: 'whatsapp' | 'phone' | 'email' | 'in-person'
  pipelineStage: PipelineStage
  stageChangedAt?: string
  stageNote?: string
  createdAt: string
  updatedAt: string
}

/**
 * The client journey from brief §31. 'Lost' is not in the brief's list but is
 * required to answer the question the pipeline exists to answer — where
 * enquiries stop progressing.
 */
export type PipelineStage =
  | 'New Enquiry'
  | 'Contacted'
  | 'Consultation Booked'
  | 'Consultation Completed'
  | 'Proposal Sent'
  | 'Awaiting Decision'
  | 'Enrolled'
  | 'Active Learner'
  | 'Lost'

export const PIPELINE_STAGES: PipelineStage[] = [
  'New Enquiry',
  'Contacted',
  'Consultation Booked',
  'Consultation Completed',
  'Proposal Sent',
  'Awaiting Decision',
  'Enrolled',
  'Active Learner',
  'Lost',
]

export interface PipelineSummary {
  stages: Array<{ stage: PipelineStage; count: number }>
  totals: {
    active: number
    enrolled: number
    lost: number
    /** Share of decided enquiries that enrolled; null until something is decided. */
    conversionRate: number | null
  }
}

export interface DashboardStats {
  totalInquiries: number
  newInquiries: number
  respondedInquiries: number
  enrollments: number
  totalServices: number
  activeTestimonials: number
}

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'staff' | 'tutor' | 'student' | 'user'
  createdAt: string
}

export type SessionStatus = 'Scheduled' | 'Attended' | 'Missed' | 'Cancelled'
export type AssessmentType = 'Assignment' | 'Test' | 'Mock Examination' | 'Observation' | 'Progress Report'

export interface AttendanceSummary {
  attended: number
  missed: number
  cancelled: number
  scheduled: number
  /** Null until at least one session has reached an outcome. */
  percentage: number | null
}

export interface PortalLearner {
  id: number
  name: string
  programme?: string
  curriculum?: string
  gradeClass?: string
  learningModel?: 'online' | 'home-based' | 'centre-based' | 'blended'
  supportNotes?: string
  attendance: AttendanceSummary
}

export interface PortalSession {
  id: number
  learnerId?: number
  subject: string
  scheduledFor: string
  durationMinutes: number
  deliveryMode?: 'online' | 'home-based' | 'centre-based'
  status: SessionStatus
  topicsCovered?: string
  lessonNotes?: string
  /** Educator-only: a concern is not surfaced to the parent. */
  concernFlagged?: boolean
  concernNote?: string
}

export interface PortalAssessment {
  id: number
  learnerId?: number
  subject: string
  title: string
  type: AssessmentType
  score?: number | null
  maxScore?: number | null
  comment?: string
  learningObjectives?: string
  assessedOn: string
  isReleased: boolean
}

export interface PortalOverview {
  role: 'student' | 'tutor'
  learners: PortalLearner[]
  programmes: Array<{ id: number; name: string; status: string; ageGroup?: string; createdAt: string }>
  upcomingSessions: PortalSession[]
  recentAssessments: PortalAssessment[]
  schedule: Array<{ id: number; title: string; date: string }>
  messages: Array<{ id: number; subject: string; preview: string; createdAt: string }>
}

/** Administration views of a learner (brief §30). */
export interface AssignableUser {
  id: number
  name: string
  email: string
  role: 'student' | 'tutor'
}

export interface LearnerAssignment {
  id: number
  learnerId: number
  educatorUserId: number
  subject?: string | null
  isActive: boolean
  educator?: AssignableUser
}

export interface AdminLearner {
  id: number
  name: string
  parentUserId: number
  programme?: string | null
  curriculum?: string | null
  gradeClass?: string | null
  learningModel?: 'online' | 'home-based' | 'centre-based' | 'blended' | null
  supportNotes?: string | null
  isActive: boolean
  createdAt: string
  parent?: AssignableUser
  assignments?: LearnerAssignment[]
}

/** A message in a learner's conversation (brief §28 communication). */
export interface PortalMessageItem {
  id: number
  body: string
  senderRole: 'student' | 'tutor' | 'staff' | 'admin'
  senderName: string
  /** Set by the server so the client can align the thread without user ids. */
  isMine: boolean
  createdAt: string
}

/** Educator vetting (brief §38). */
export type VettingStatus = 'Not started' | 'In progress' | 'Cleared' | 'Rejected' | 'Suspended'

export interface VettingRow {
  educatorUserId: number
  name: string
  email: string
  status: VettingStatus
  goodConductNumber: string | null
  goodConductExpiresOn: string | null
  tscNumber: string | null
  identityVerifiedOn: string | null
  referencesCheckedOn: string | null
  /** Cleared and not lapsed — the only state that permits assignment. */
  cleared: boolean
  expired: boolean
  expiringSoon: boolean
}

export type ConcernStatus = 'Open' | 'Acknowledged' | 'Under review' | 'Resolved' | 'Escalated'

export interface SafeguardingConcern {
  id: number
  learnerId: number | null
  raisedByRole: 'student' | 'tutor' | 'staff' | 'admin'
  category: string
  detail: string
  status: ConcernStatus
  outcome: string | null
  createdAt: string
  learner?: { id: number; name: string } | null
  raisedBy?: { id: number; name: string; role: string } | null
}

/** Account administration (brief §28-§30). */
export type AccountRole = 'admin' | 'staff' | 'tutor' | 'student'

export interface Account {
  id: number
  name: string
  email: string
  role: AccountRole
  isActive: boolean
  mustChangePassword: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface PortalLearnerRecord {
  learner: Omit<PortalLearner, 'attendance'>
  attendance: AttendanceSummary
  sessions: PortalSession[]
  assessments: PortalAssessment[]
}

export interface Newsletter {
  id: number
  email: string
  subscribedAt: string
  isActive: boolean
}

export interface AuditLog {
  id: number
  userId?: number
  action: string
  entity: string
  entityId?: number
  metadata?: Record<string, unknown>
  ipAddress?: string
  createdAt: string
  user?: { id: number; name: string; email: string } | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

// Request Body Types

export interface CreateContactRequest {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  programme?: string
}

export interface UpdateContactStatusRequest {
  status: 'new' | 'read' | 'replied' | 'closed'
}

export interface CreateEnrollmentRequest {
  studentName: string
  parentName?: string
  email: string
  phone?: string
  programme: string
  ageGroup: 'child' | 'teenager' | 'adult'
  learnerAge?: number
  location?: string
  currentSchool?: string
  curriculum?: string
  gradeClass?: string
  subjects?: string
  learningNeeds?: string
  preferredLearningModel?: 'online' | 'home-based' | 'centre-based' | 'blended' | 'not-sure'
  preferredDays?: string
  preferredTimes?: string
  contactConsent: boolean
  notes?: string
}

/** The short consultation form (brief §3.2, §13) — far less than a full enquiry. */
export interface CreateConsultationRequest {
  parentName: string
  email: string
  phone?: string
  studentName?: string
  learnerAge?: number
  notes?: string
  preferredDays?: string
  preferredTimes?: string
  preferredChannel?: 'whatsapp' | 'phone' | 'email' | 'in-person'
  contactConsent: boolean
}

export interface CreateServiceRequest {
  title: string
  slug: string
  icon: string
  description: string
  items: string[]
  order?: number
  isActive?: boolean
}

export interface UpdateServiceRequest {
  title?: string
  slug?: string
  icon?: string
  description?: string
  items?: string[]
  order?: number
  isActive?: boolean
}

export interface CreateTestimonialRequest {
  text: string
  author: string
  role: string
  rating: number
  /** Both are required by the API: a quote cannot be published without them. */
  consentConfirmed: boolean
  consentReference: string
}

export interface UpdateTestimonialRequest {
  text?: string
  author?: string
  role?: string
  rating?: number
  consentConfirmed?: boolean
  consentReference?: string
  isActive?: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface NewsletterSubscribeRequest {
  email: string
}

export type EducatorCategory = 'Leadership' | 'Education Consultant' | 'Teacher' | 'Tutor' | 'Language Educator' | 'Specialist Educator' | 'Coach' | 'Artist' | 'Administrator'

export interface Educator {
  id: string
  name: string
  position: string
  category: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateEducatorRequest {
  name: string
  position: string
  category: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
}

export interface UpdateEducatorRequest {
  name?: string
  position?: string
  category?: EducatorCategory
  qualifications?: string
  experience?: string
  subjects?: string[]
  languages?: string[]
  expertise?: string
  biography?: string
  photo?: string
  email?: string
  phone?: string
  isActive?: boolean
  sortOrder?: number
}

export type EventCategory = 'Holiday Tuition' | 'Exam Preparation' | 'Competition' | 'Workshop' | 'Cultural Event' | 'Sports Event' | 'Enrichment' | 'Other'
export type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'

export interface Event {
  id: string
  title: string
  description: string
  category: EventCategory
  startDate: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  photos?: string[]
  videos?: string[]
  results?: string
  recap?: string
  status: EventStatus
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateEventRequest {
  title: string
  description: string
  category: EventCategory
  startDate: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  status?: EventStatus
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  category?: EventCategory
  startDate?: string
  endDate?: string
  venue?: string
  location?: string
  capacity?: number
  ageGroup?: string
  programme?: string
  priceKES?: number
  registrationDeadline?: string
  registrationLink?: string
  poster?: string
  photos?: string[]
  videos?: string[]
  results?: string
  recap?: string
  status?: EventStatus
  isActive?: boolean
  sortOrder?: number
}

export type FAQCategory = 'General' | 'Programmes & Curricula' | 'Enrollment' | 'Special Needs' | 'Languages' | 'Locations' | 'Fees & Payments' | 'Educators' | 'Portals & Learning' | 'Technical'

export interface FAQ {
  id: string
  question: string
  answer: string
  category: FAQCategory
  order: number
  isActive: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateFAQRequest {
  question: string
  answer: string
  category?: FAQCategory
  order?: number
}

export interface UpdateFAQRequest {
  question?: string
  answer?: string
  category?: FAQCategory
  order?: number
  isActive?: boolean
}

export type GalleryType = 'Photo' | 'Video'
export type GalleryCategory = 'Event' | 'Programme' | 'Activity' | 'General'

export interface GalleryItem {
  id: string
  title: string
  type: GalleryType
  category: GalleryCategory
  description?: string
  url: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed: boolean
  consentConfirmedBy?: number | null
  consentConfirmedAt?: string | null
  consentReference?: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateGalleryRequest {
  title: string
  type?: GalleryType
  category?: GalleryCategory
  description?: string
  url: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed: boolean
  /** Reference to the signed media release held on file (brief §38). */
  consentReference: string
}

export interface UpdateGalleryRequest {
  title?: string
  type?: GalleryType
  category?: GalleryCategory
  description?: string
  url?: string
  thumbnail?: string
  tags?: string[]
  consentConfirmed?: boolean
  consentReference?: string
  isActive?: boolean
  sortOrder?: number
}

/** Subjects, not article shapes — kept in step with server/content/resourceCategories.js. */
export const RESOURCE_CATEGORIES = [
  'Homeschooling',
  'Cambridge',
  'Montessori',
  'CBC',
  'Special Needs Education',
  'Foreign Languages',
  'Games & Sports',
  'Enrichment',
  'Technology & Innovation',
  'Parenting & Learning',
  'Current Affairs',
] as const

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]

export type ResourceStatus = 'Draft' | 'Published'

export interface Resource {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category: ResourceCategory
  status: ResourceStatus
  metaDescription?: string
  author: string
  coverImage?: string
  sourceUrl?: string | null
  fileUrl?: string | null
  readTime?: string
  tags?: string[]
  isActive: boolean
  sortOrder: number
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateResourceRequest {
  title: string
  slug?: string
  excerpt?: string
  /** Optional: a work Axis links to rather than wrote has no body. */
  content?: string
  category?: ResourceCategory
  author?: string
  coverImage?: string
  sourceUrl?: string | null
  fileUrl?: string | null
  readTime?: string
  tags?: string[]
  publishedAt?: string
}

export interface UpdateResourceRequest {
  title?: string
  slug?: string
  excerpt?: string
  content?: string
  category?: ResourceCategory
  author?: string
  coverImage?: string
  sourceUrl?: string | null
  fileUrl?: string | null
  readTime?: string
  tags?: string[]
  isActive?: boolean
  sortOrder?: number
  publishedAt?: string
}

export type PartnerCategory = 'Corporate' | 'Educational Institution' | 'Tech Partner' | 'Content Provider' | 'Community Partner'

export interface Partner {
  id: string
  name: string
  logo?: string
  category: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerRequest {
  name: string
  logo?: string
  category?: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
}

export interface UpdatePartnerRequest {
  name?: string
  logo?: string
  category?: PartnerCategory
  description?: string
  website?: string
  contact?: string
  email?: string
  phone?: string
  focusAreas?: string[]
  isActive?: boolean
  sortOrder?: number
}

export type LocationType = 'Head Office' | 'Learning Centre' | 'Partner Facility' | 'Educator Hub' | 'Home-Based Service'

export interface Location {
  id: string
  name: string
  type: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateLocationRequest {
  name: string
  type: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
}

export interface UpdateLocationRequest {
  name?: string
  type?: LocationType
  address?: string
  city?: string
  county?: string
  phone?: string
  email?: string
  description?: string
  programmes?: string[]
  photo?: string
  latitude?: number
  longitude?: number
  isActive?: boolean
  sortOrder?: number
}

/** Retention policy, in days, as the server defines it. */
export interface RetentionPolicy {
  unconvertedEnquiryDays: number
  contactMessageDays: number
  auditLogDays: number
}

/** Counts of records already past their retention period. */
export interface RetentionDue {
  unconvertedEnquiries: number
  contactMessages: number
  auditEntries: number
}

export interface RetentionReport {
  policy: RetentionPolicy
  dueForDeletion: RetentionDue
  note: string
}

/** What applying the schedule actually removed. */
export interface RetentionRemoved {
  unconvertedEnquiries: number
  contactMessages: number
}
