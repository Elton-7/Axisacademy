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
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateTestimonialRequest,
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
  PortalOverview,
  ApiResponse,
  ApiListResponse,
} from '../types'

/**
 * The API envelope types `data` as optional, because an error response omits it.
 * A 2xx response that omits the payload is a server contract violation, not
 * something every call site should have to null-check — so we fail loudly here
 * and let callers work with a defined value.
 */
function unwrap<T>(payload: { data?: T; error?: string; message?: string }): T {
  if (payload.data === undefined) {
    throw new Error(payload.error || payload.message || 'The server returned no data for this request.')
  }
  return payload.data
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
}

// Educators
export const educatorsApi = {
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    const { data } = await api.get<any>('/educators', { params })
    return data
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
    const { data } = await api.get<any>('/events', { params })
    return data
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
    const { data } = await api.get<any>('/faqs', { params })
    return data
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
    const { data } = await api.get<any>('/locations', { params })
    return data
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
    const { data } = await api.get<any>('/gallery', { params })
    return data
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
    const { data } = await api.get<any>('/resources', { params })
    return data
  },

  async getById(id: string) {
    const { data } = await api.get<ApiResponse<Resource>>(`/resources/${id}`)
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
    const { data } = await api.get<any>('/partners', { params })
    return data
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
