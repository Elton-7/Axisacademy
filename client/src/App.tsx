import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Philosophy from './pages/Philosophy'
import LearningPaths from './pages/LearningPaths'
import EducatorNetwork from './pages/EducatorNetwork'
import Programmes from './pages/Programmes'
import Team from './pages/Team'
import Events from './pages/Events'
import FAQ from './pages/FAQ'
import Locations from './pages/Locations'
import Gallery from './pages/Gallery'
import Resources from './pages/Resources'
import Partners from './pages/Partners'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import Enrollment from './pages/Enrollment'
import { authApi } from './services/apiClient'
import NotFound from './pages/NotFound'
import PortalLogin from './pages/PortalLogin'
import PortalDashboard from './pages/PortalDashboard'
import Privacy from './pages/Privacy'

function ProtectedAdminRoute() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('axis_token')) {
      setIsAuthorized(false)
      return
    }

    authApi.getCurrentUser()
      .then((user) => setIsAuthorized(user.role === 'admin' || user.role === 'staff'))
      .catch(() => setIsAuthorized(false))
  }, [])

  if (isAuthorized === null) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-navy-600">Checking access...</div>
  }

  return isAuthorized ? <AdminDashboard /> : <Navigate to="/admin/login" replace />
}

function ProtectedPortalRoute({ role }: { role: 'student' | 'tutor' }) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (!localStorage.getItem('axis_token')) {
      setIsAuthorized(false)
      return
    }
    authApi.getCurrentUser()
      .then((user) => setIsAuthorized(user.role === role))
      .catch(() => setIsAuthorized(false))
  }, [role])

  if (isAuthorized === null) return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-navy-600">Checking access...</div>
  return isAuthorized ? <PortalDashboard role={role} /> : <Navigate to={`/portal/${role}`} replace />
}

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="philosophy" element={<Philosophy />} />
          <Route path="learning-paths" element={<LearningPaths />} />
          <Route path="educator-network" element={<EducatorNetwork />} />
          <Route path="programmes" element={<Programmes />} />
          <Route path="team" element={<Team />} />
          <Route path="events" element={<Events />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="locations" element={<Locations />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="resources" element={<Resources />} />
          <Route path="partners" element={<Partners />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="enroll" element={<Enrollment />} />
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<ProtectedAdminRoute />} />
          <Route path="portal/student" element={<PortalLogin role="student" />} />
          <Route path="portal/student/dashboard" element={<ProtectedPortalRoute role="student" />} />
          <Route path="portal/tutor" element={<PortalLogin role="tutor" />} />
          <Route path="portal/tutor/dashboard" element={<ProtectedPortalRoute role="tutor" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App
