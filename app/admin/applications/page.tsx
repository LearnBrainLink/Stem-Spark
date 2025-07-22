'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  full_name: string
  email: string
  phone: string | null
  grade: number
  school: string
  bio: string
  specialties: string[] | null
  experience: string | null
  motivation: string
  availability: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

interface User {
  id: string
  role: string
  is_super_admin: boolean
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserAndLoadApplications()
  }, [])

  const checkUserAndLoadApplications = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }

      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        setMessage('Error loading user profile')
        setLoading(false)
        return
      }

      // Check if user is admin or super admin
      if (profile.role !== 'admin' && !profile.is_super_admin) {
        setMessage('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      setCurrentUser({
        id: user.id,
        role: profile.role,
        is_super_admin: profile.is_super_admin || false
      })

      // Load applications
      await loadApplications()
    } catch (error) {
      console.error('Error checking user:', error)
      setMessage('Error checking user authentication')
      setLoading(false)
    }
  }

  const loadApplications = async () => {
    try {
      setLoading(true)
      setMessage('')

      const { data, error } = await supabase
        .from('intern_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading applications:', error)
        setMessage('Error loading applications')
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
      setMessage('Error loading applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      if (!currentUser) {
        setMessage('User not authenticated')
        return
      }

      // Check if user can edit other admins
      if (currentUser.role === 'admin' && !currentUser.is_super_admin) {
        // Regular admins can't edit other admins
        const application = applications.find(app => app.id === applicationId)
        if (application) {
          // Check if the applicant is an admin (this would require additional logic)
          // For now, allow the update but log it
          console.log('Admin updating application:', applicationId)
        }
      }

      const { error } = await supabase
        .from('intern_applications')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application:', error)
        setMessage('Error updating application status')
        return
      }

      // Reload applications
      await loadApplications()
      setMessage(`Application ${status} successfully`)
    } catch (error) {
      console.error('Error updating application:', error)
      setMessage('Error updating application status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Intern Applications</h1>
            <p className="text-gray-600 mt-1">Review and manage intern applications</p>
          </div>

          {message && (
            <div className={`p-4 mx-6 mt-4 rounded-md ${
              message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <div className="p-6">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">When students submit intern applications, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((application) => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{application.full_name}</h3>
                        <p className="text-gray-600">{application.email}</p>
                        {application.phone && (
                          <p className="text-gray-600">{application.phone}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Grade {application.grade}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">School</h4>
                        <p className="text-gray-600">{application.school}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.specialties && application.specialties.length > 0 ? (
                            application.specialties.map((specialty, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                {specialty}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No specialties listed</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
                      <p className="text-gray-600">{application.bio}</p>
                    </div>

                    {application.experience && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                        <p className="text-gray-600">{application.experience}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Motivation</h4>
                      <p className="text-gray-600">{application.motivation}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Availability</h4>
                      <p className="text-gray-600">{application.availability}</p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Applied: {formatDate(application.created_at)}
                      </div>
                      
                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 