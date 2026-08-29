import api from './api'
import {
  Service,
  Testimonial,
  Contact,
  Enrollment,
  Educator,
  Event,
  FAQ,
  GalleryItem,
  Resource,
  Partner,
  Location,
  DashboardStats,
  User,
  Newsletter,
  AuditLog,
  CreateContactRequest,
  UpdateContactStatusRequest,
  CreateEnrollmentRequest,
  CreateConsultationRequest,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  CreateEducatorRequest,
  UpdateEducatorRequest,
  CreateEventRequest,
  UpdateEventRequest,
  CreateFAQRequest,
  UpdateFAQRequest,
  CreateGalleryRequest,
  UpdateGalleryRequest,
  CreateResourceRequest,
  UpdateResourceRequest,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  CreateLocationRequest,
  UpdateLocationRequest,
  LoginRequest,
  LoginResponse,
  NewsletterSubscribeRequest,
  PipelineStage,
  PipelineSummary,
  PortalOverview,
  PortalLearnerRecord,
  PortalMessageItem,
  PortalSession,
  AdminLearner,
  Account,
  AccountRole,
  VettingRow,
  VettingStatus,
  SafeguardingConcern,
  AssignableUser,
  LearnerAssignment,
  PortalAssessment,
  SessionStatus,
  AssessmentType,
  ApiResponse,
  ApiListResponse,
  RetentionReport,
  RetentionRemoved,
} from '../types'

/**
 * Every API route envelopes its payload as `{ success, data }`. This unwraps it
 * so callers receive the value itself.
 *
 * An enveloped 2xx response that omits `data` is a server contract violation
 * rather than something 38 call sites should null-check, so that fails loudly.
 *
 * The bare-payload overload remains because a response that is already the
 * value passes through untouched — which keeps a stale cached bundle working
 * against a freshly deployed API, and vice versa.
 */
function unwrap<T>(payload: ApiListResponse<T>): T[]
function unwrap<T>(payload: ApiResponse<T>): T
function unwrap<T>(payload: T): T
function unwrap(payload: unknown): unknown {
  const isEnvelope = payload !== null && typeof payload === 'object' && 'success' in payload

  if (!isEnvelope) {
    // A bare record — already the value the caller wants.
    return payload
  }

  const envelope = payload as { data?: unknown; error?: string; message?: string }
  if (envelope.data === undefined) {
    throw new Error(
      envelope.error || envelope.message || 'The server returned no data for this request.'
    )
  }
  return envelope.data
}

// Services
export const servicesApi = {
  async getAll() {
    const { data } = await api.get<ApiListResponse<Service>>('/services')
    return unwrap(data)
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<Service>>(`/services/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateServiceRequest) {
    const { data } = await api.post<ApiResponse<Service>>('/services', payload)
    return unwrap(data)
  },

  async update(id: number, payload: UpdateServiceRequest) {
    const { data } = await api.put<ApiResponse<Service>>(`/services/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: number) {
    await api.delete(`/services/${id}`)
  },
}

// Testimonials
export const testimonialsApi = {
  async getAll() {
    const { data } = await api.get<ApiListResponse<Testimonial>>('/testimonials')
    return unwrap(data)
  },

  async create(payload: CreateTestimonialRequest) {
    const { data } = await api.post<ApiResponse<Testimonial>>('/testimonials', payload)
    return unwrap(data)
  },

  async update(id: number, payload: UpdateTestimonialRequest) {
    const { data } = await api.put<ApiResponse<Testimonial>>(`/testimonials/${id}`, payload)
    return unwrap(data)
  },

  /**
   * Takes the quote off the site. The record is kept.
   *
   * Not unwrapped: a delete answers with a message and no `data`, and `unwrap`
   * treats a missing `data` as a failure — so unwrapping turned a successful
   * removal into "Failed to remove the quote" while the quote had in fact gone.
   * Every other delete here does the same.
   */
  async delete(id: number) {
    await api.delete(`/testimonials/${id}`)
  },
}

// Educators
export const educatorsApi = {
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<Educator>>('/educators', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Educator>>(`/educators/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateEducatorRequest) {
    const { data } = await api.post<ApiResponse<Educator>>('/educators', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateEducatorRequest) {
    const { data } = await api.put<ApiResponse<Educator>>(`/educators/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/educators/${id}`)
  },
}

// Events
export const eventsApi = {
  async getAll(params?: { category?: string; status?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<Event>>('/events', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Event>>(`/events/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateEventRequest) {
    const { data } = await api.post<ApiResponse<Event>>('/events', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateEventRequest) {
    const { data } = await api.put<ApiResponse<Event>>(`/events/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/events/${id}`)
  },
}

// FAQs
export const faqsApi = {
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<FAQ>>('/faqs', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<FAQ>>(`/faqs/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateFAQRequest) {
    const { data } = await api.post<ApiResponse<FAQ>>('/faqs', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateFAQRequest) {
    const { data } = await api.put<ApiResponse<FAQ>>(`/faqs/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/faqs/${id}`)
  },
}

// Locations
export const locationsApi = {
  async getAll(params?: { type?: string; county?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<Location>>('/locations', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Location>>(`/locations/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateLocationRequest) {
    const { data } = await api.post<ApiResponse<Location>>('/locations', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateLocationRequest) {
    const { data } = await api.put<ApiResponse<Location>>(`/locations/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/locations/${id}`)
  },
}

// Gallery
export const galleryApi = {
  async getAll(params?: { category?: string; type?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<GalleryItem>>('/gallery', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<GalleryItem>>(`/gallery/${id}`)
    return unwrap(data)
  },

  async create(payload: CreateGalleryRequest) {
    const { data } = await api.post<ApiResponse<GalleryItem>>('/gallery', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateGalleryRequest) {
    const { data } = await api.put<ApiResponse<GalleryItem>>(`/gallery/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/gallery/${id}`)
  },
}

// Resources
export const resourcesApi = {
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<Resource>>('/resources', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Resource>>(`/resources/${id}`)
    return unwrap(data)
  },

  /** By slug, which is what an article's URL carries. */
  async getBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<Resource>>(`/resources/slug/${slug}`)
    return unwrap(data)
  },

  async create(payload: CreateResourceRequest) {
    const { data } = await api.post<ApiResponse<Resource>>('/resources', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdateResourceRequest) {
    const { data } = await api.put<ApiResponse<Resource>>(`/resources/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/resources/${id}`)
  },
}

// Partners
export const partnersApi = {
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<ApiListResponse<Partner>>('/partners', { params })
    return unwrap(data)
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Partner>>(`/partners/${id}`)
    return unwrap(data)
  },

  async create(payload: CreatePartnerRequest) {
    const { data } = await api.post<ApiResponse<Partner>>('/partners', payload)
    return unwrap(data)
  },

  async update(id: string, payload: UpdatePartnerRequest) {
    const { data } = await api.put<ApiResponse<Partner>>(`/partners/${id}`, payload)
    return unwrap(data)
  },

  async delete(id: string) {
    await api.delete(`/partners/${id}`)
  },
}

// Contacts
export const contactsApi = {
  async getAll(params?: { page?: number; limit?: number; search?: string; status?: Contact['status'] | 'all' }) {
    const { data } = await api.get<ApiListResponse<Contact>>('/contacts', { params })
    return data
  },

  async submit(payload: CreateContactRequest) {
    const { data } = await api.post<ApiResponse<Contact>>('/contacts', payload)
    return unwrap(data)
  },

  async updateStatus(id: number, payload: UpdateContactStatusRequest) {
    const { data } = await api.patch<ApiResponse<Contact>>(`/contacts/${id}/status`, payload)
    return unwrap(data)
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<Contact>>(`/contacts/${id}`)
    return unwrap(data)
  },

  async delete(id: number) {
    await api.delete(`/contacts/${id}`)
  },
}

// Enrollments
export const enrollmentsApi = {
  async getAll(params?: { page?: number; limit?: number }) {
    const { data } = await api.get<ApiListResponse<Enrollment>>('/enrollments', { params })
    return data
  },

  async create(payload: CreateEnrollmentRequest) {
    const { data } = await api.post<ApiResponse<Enrollment>>('/enrollments', payload)
    return unwrap(data)
  },

  /** Short consultation request — lands in the same pipeline, tagged. */
  async requestConsultation(payload: CreateConsultationRequest) {
    const { data } = await api.post<ApiResponse<Enrollment>>('/enrollments/consultation', payload)
    return unwrap(data)
  },

  async getById(id: number) {
    const { data } = await api.get<ApiResponse<Enrollment>>(`/enrollments/${id}`)
    return unwrap(data)
  },

  async updateStatus(id: number, status: Enrollment['status']) {
    const { data } = await api.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/status`, {
      status,
    })
    return unwrap(data)
  },

  async updateStage(id: number, pipelineStage: PipelineStage, stageNote?: string) {
    const { data } = await api.patch<ApiResponse<Enrollment>>(`/enrollments/${id}/stage`, {
      pipelineStage,
      ...(stageNote !== undefined && { stageNote }),
    })
    return unwrap(data)
  },

  async getPipelineSummary() {
    const { data } = await api.get<ApiResponse<PipelineSummary>>('/enrollments/pipeline/summary')
    return unwrap(data)
  },
}

// Dashboard/Statistics
export const statsApi = {
  async getDashboardStats() {
    const { data } = await api.get<ApiResponse<DashboardStats>>('/stats/dashboard')
    return unwrap(data)
  },
}

// Authentication
export const authApi = {
  async login(payload: LoginRequest) {
    const { data } = await api.post<LoginResponse>('/auth/login', payload)
    const { token, user } = data
    localStorage.setItem('axis_token', token)
    return user
  },

  async logout() {
    localStorage.removeItem('axis_token')
  },

  /**
   * Replaces the caller's own password — how a temporary one issued by an
   * administrator stops being the permanent one.
   *
   * Not unwrapped: this answers with a message and no `data`, and `unwrap`
   * treats a missing `data` as a failure. Unwrapping it would report a
   * successful change as an error, which is how the testimonial delete once
   * claimed to fail while having worked.
   */
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    await api.post('/auth/change-password', payload)
  },

  /**
   * Asks for a reset link.
   *
   * Succeeds whether or not the address has an account — deliberately, so the
   * site cannot be used to find out which families are Axis families. Callers
   * must not treat success as confirmation that an account exists.
   */
  async requestPasswordReset(email: string) {
    await api.post('/auth/forgot-password', { email })
  },

  /** Uses a link from that email. Single use, and only while it is valid. */
  async resetPassword(payload: { token: string; newPassword: string }) {
    await api.post('/auth/reset-password', payload)
  },

  async getCurrentUser() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me')
    return unwrap(data)
  },
}

// Student and tutor portals
export const portalApi = {
  async getOverview() {
    const { data } = await api.get<ApiResponse<PortalOverview>>('/portal/overview')
    return unwrap(data)
  },

  async getLearner(id: number) {
    const { data } = await api.get<ApiResponse<PortalLearnerRecord>>(`/portal/learners/${id}`)
    return unwrap(data)
  },

  async getMessages(learnerId: number) {
    const { data } = await api.get<ApiResponse<PortalMessageItem[]>>(`/portal/learners/${learnerId}/messages`)
    return unwrap(data)
  },

  async sendMessage(learnerId: number, body: string) {
    const { data } = await api.post<ApiResponse<PortalMessageItem>>(
      `/portal/learners/${learnerId}/messages`,
      { body }
    )
    return unwrap(data)
  },

  /** Educator only — marks attendance and records what the session covered. */
  async updateSession(
    id: number,
    payload: {
      status?: SessionStatus
      topicsCovered?: string
      lessonNotes?: string
      concernFlagged?: boolean
      concernNote?: string
      /**
       * Required before a home-based session can be marked attended. The API
       * has always accepted these; the type did not list them, so nothing ever
       * sent them and no home visit could be recorded as attended.
       */
      checkInAt?: string | null
      checkOutAt?: string | null
      adultPresent?: boolean
    }
  ) {
    const { data } = await api.patch<ApiResponse<PortalSession>>(`/portal/sessions/${id}`, payload)
    return unwrap(data)
  },

  /** Educator only — recorded as a draft until released to the family. */
  async recordAssessment(payload: {
    learnerId: number
    subject: string
    title: string
    type?: AssessmentType
    score?: number | null
    maxScore?: number | null
    comment?: string
    learningObjectives?: string
    assessedOn?: string
  }) {
    const { data } = await api.post<ApiResponse<PortalAssessment>>('/portal/assessments', payload)
    return unwrap(data)
  },
}

/** Learner administration (brief §30). Staff only. */
export const learnersApi = {
  async getAll(params?: { search?: string }) {
    const { data } = await api.get<ApiResponse<AdminLearner[]>>('/learners', { params })
    return unwrap(data)
  },

  async getAssignableUsers(role: 'student' | 'tutor') {
    const { data } = await api.get<ApiResponse<AssignableUser[]>>('/learners/assignable-users', {
      params: { role },
    })
    return unwrap(data)
  },

  async create(payload: {
    name: string
    parentUserId: number
    programme?: string
    curriculum?: string
    gradeClass?: string
    learningModel?: string | null
    supportNotes?: string
  }) {
    const { data } = await api.post<ApiResponse<AdminLearner>>('/learners', payload)
    return unwrap(data)
  },

  async update(id: number, payload: Partial<Omit<AdminLearner, 'id' | 'createdAt'>>) {
    const { data } = await api.put<ApiResponse<AdminLearner>>(`/learners/${id}`, payload)
    return unwrap(data)
  },

  async assignEducator(learnerId: number, educatorUserId: number, subject?: string) {
    const { data } = await api.post<ApiResponse<LearnerAssignment>>(
      `/learners/${learnerId}/educators`,
      { educatorUserId, subject }
    )
    return unwrap(data)
  },

  async endAssignment(learnerId: number, assignmentId: number) {
    await api.delete(`/learners/${learnerId}/educators/${assignmentId}`)
  },

  async scheduleSession(
    learnerId: number,
    payload: {
      subject: string
      scheduledFor: string
      durationMinutes?: number
      deliveryMode?: string | null
      educatorUserId?: number | null
    }
  ) {
    const { data } = await api.post<ApiResponse<PortalSession>>(`/learners/${learnerId}/sessions`, payload)
    return unwrap(data)
  },
}

/** Vetting and safeguarding (brief §38). Staff only. */
export const safeguardingApi = {
  async getVetting() {
    const { data } = await api.get<ApiResponse<VettingRow[]>>('/learners/vetting/all')
    return unwrap(data)
  },

  async updateVetting(educatorUserId: number, payload: {
    status?: VettingStatus
    goodConductNumber?: string
    goodConductIssuedOn?: string
    goodConductExpiresOn?: string
    tscNumber?: string
    identityVerifiedOn?: string
    referencesCheckedOn?: string
    referencesNote?: string
    notes?: string
  }) {
    const { data } = await api.put<ApiResponse<unknown>>(`/learners/vetting/${educatorUserId}`, payload)
    return unwrap(data)
  },

  async getConcerns() {
    const { data } = await api.get<ApiResponse<SafeguardingConcern[]>>('/portal/concerns')
    return unwrap(data)
  },

  async updateConcern(id: number, payload: { status?: string; outcome?: string }) {
    const { data } = await api.patch<ApiResponse<SafeguardingConcern>>(`/portal/concerns/${id}`, payload)
    return unwrap(data)
  },

  async exportLearner(learnerId: number) {
    const { data } = await api.get<ApiResponse<unknown>>(`/data-protection/learners/${learnerId}/export`)
    return unwrap(data)
  },

  async eraseLearner(learnerId: number, confirmName: string) {
    await api.delete(`/data-protection/learners/${learnerId}`, { data: { confirmName } })
  },

  /** What is past its retention period. Reading is staff; applying is admin. */
  async getRetention() {
    const { data } = await api.get<ApiResponse<RetentionReport>>('/data-protection/retention')
    return unwrap(data)
  },

  async applyRetention() {
    const { data } = await api.post<ApiResponse<RetentionRemoved>>('/data-protection/retention/apply')
    return unwrap(data)
  },
}

/** Account administration. Reading is staff; changing is admin only. */
export const accountsApi = {
  async getAll() {
    const { data } = await api.get<ApiResponse<Account[]>>('/users')
    return unwrap(data)
  },

  /** The temporary password comes back once and is never retrievable again. */
  async create(payload: { name: string; email: string; role: AccountRole }) {
    const { data } = await api.post<ApiResponse<Account & { temporaryPassword: string }>>('/users', payload)
    return unwrap(data)
  },

  async update(id: number, payload: { name?: string; role?: AccountRole; isActive?: boolean }) {
    const { data } = await api.patch<ApiResponse<{ assignmentsEnded: number }>>(`/users/${id}`, payload)
    return unwrap(data)
  },

  async resetPassword(id: number) {
    const { data } = await api.post<ApiResponse<{ temporaryPassword: string }>>(`/users/${id}/reset-password`, {})
    return unwrap(data)
  },
}

// Newsletter
export const newsletterApi = {
  async getAll() {
    const { data } = await api.get<ApiListResponse<Newsletter>>('/newsletter')
    return unwrap(data)
  },

  async subscribe(payload: NewsletterSubscribeRequest) {
    const { data } = await api.post<ApiResponse<Newsletter>>('/newsletter/subscribe', payload)
    return unwrap(data)
  },

  async unsubscribe(email: string) {
    await api.post('/newsletter/unsubscribe', { email })
  },
}

// Audit activity
export const auditApi = {
  async getAll(params?: { page?: number; limit?: number; action?: string; entity?: string }) {
    const { data } = await api.get<ApiListResponse<AuditLog>>('/audit', { params })
    return data
  },
}

// Health Check
export const healthApi = {
  async check() {
    const { data } = await api.get('/health')
    return data
  },
}
