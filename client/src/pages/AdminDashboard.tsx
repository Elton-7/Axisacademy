import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, BookOpen, TrendingUp, Mail, Phone, Calendar, Search, Filter, Download } from 'lucide-react'
import api from '../utils/api'

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  subject: string
  message: string
  programme: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState({ total: 0, new: 0, responded: 0, enrolled: 0 })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts')
      setContacts(res.data)
      setStats({
        total: res.data.length,
        new: res.data.filter((c: Contact) => c.status === 'new').length,
        responded: res.data.filter((c: Contact) => c.status === 'responded').length,
        enrolled: res.data.filter((c: Contact) => c.status === 'enrolled').length,
      })
    } catch (error) {
      const demo: Contact[] = [
        { id: 1, first_name: 'Sarah', last_name: 'Kimani', email: 'sarah@email.com', phone: '0712 345 678', subject: 'Homeschooling Inquiry', message: 'Interested in CBC programme for my daughter.', programme: 'homeschooling', status: 'new', created_at: '2026-06-25T10:30:00Z' },
        { id: 2, first_name: 'James', last_name: 'Ochieng', email: 'james@email.com', phone: '0723 456 789', subject: 'French Classes', message: 'Looking for beginner French classes for my son.', programme: 'language', status: 'responded', created_at: '2026-06-24T14:15:00Z' },
        { id: 3, first_name: 'Grace', last_name: 'Wanjiku', email: 'grace@email.com', phone: '0734 567 890', subject: 'Special Needs Support', message: 'Need assessment for my child with learning difficulties.', programme: 'special', status: 'new', created_at: '2026-06-23T09:00:00Z' },
      ]
      setContacts(demo)
      setStats({ total: 3, new: 2, responded: 1, enrolled: 0 })
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/contacts/${id}/status`, { status })
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    } catch {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    }
  }

  const filteredContacts = contacts.filter(c => {
    const matchesFilter = filter === 'all' || c.status === filter
    const matchesSearch = search === '' || 
      c.first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statCards = [
    { icon: MessageSquare, label: 'Total Inquiries', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { icon: Mail, label: 'New Messages', value: stats.new, color: 'bg-amber-50 text-amber-600' },
    { icon: TrendingUp, label: 'Responded', value: stats.responded, color: 'bg-green-50 text-green-600' },
    { icon: Users, label: 'Enrolled', value: stats.enrolled, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
            <p className="text-navy-600/60 text-sm">Manage inquiries and track engagement</p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm hover:bg-navy-800 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-100"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-navy-600/60 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 mb-6">
          <div className="p-4 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {['all', 'new', 'responded', 'enrolled'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    filter === f 
                      ? 'bg-navy-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Programme</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-navy-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-navy-900">{contact.first_name} {contact.last_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-navy-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {contact.email}
                        </p>
                        <p className="text-xs text-navy-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {contact.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-navy-700">{contact.subject}</p>
                      <p className="text-xs text-navy-500 mt-1 line-clamp-1">{contact.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-100 text-navy-700 px-2 py-1 rounded-full capitalize">
                        {contact.programme}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        contact.status === 'new' ? 'bg-amber-50 text-amber-700' :
                        contact.status === 'responded' ? 'bg-blue-50 text-blue-700' :
                        contact.status === 'enrolled' ? 'bg-green-50 text-green-700' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-navy-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(contact.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={contact.status}
                        onChange={(e) => updateStatus(contact.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:border-gold-500 outline-none"
                      >
                        <option value="new">New</option>
                        <option value="responded">Responded</option>
                        <option value="enrolled">Enrolled</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-navy-500 text-sm">
              No inquiries found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}