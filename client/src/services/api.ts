import axios from 'axios'

const normalizeBaseUrl = (value?: string) => (value ? value.replace(/\/+$/, '') : '')

const resolvedApiUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL) ||
  (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:5000/api')

const api = axios.create({
  baseURL: resolvedApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('axis_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
