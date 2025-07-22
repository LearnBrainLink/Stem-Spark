'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { adminProtectionService } from '@/lib/admin-protection'

interface Application {
  id: string
  applicant_email: string
  full_name: string
  phone_number: string | null
  date_of_birth: string
  education_level: string
  school_institution: string
  areas_of_interest: string[]
  previous_experience: string | null
  availability: {
    days_per_week: number
    hours_per_week: number
    preferred_schedule: string
  }
  motivation_statement: string
  references: any[] | null
  status: 'pending' | 'approved' | 'rejected' | 'interview_scheduled'
  submitted_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  interview_notes: string | null
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchApplications()
      getUserPermissions()
    }
  }, [currentUser])

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      setCurrentUser(user)
    } catch (error) {
      console.error('Error getting current user:', error)
      setError('Failed to get user information')
    }
  }

  const getUserPermissions = async () => {
    if (!currentUser) return
    
    try {
      const result = await adminProtectionService.getUserPermissions(currentUser.id)
      if (result.success && result.permissions) {
        setUserPermissions(result.permissions)
      }
    } catch (error) {
      console.error('Error getting user permissions:', error)
    }
  }

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('intern_applications')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected' | 'interview_scheduled', notes?: string) => {
    if (!currentUser) return

    try {
      setActionLoading(applicationId)

      // Check if user can perform this action
      const canPerform = await adminProtectionService.canPerformAdminAction(
        currentUser.id,
        status === 'approved' ? 'approve_application' : 'reject_application',
        applicationId
      )

      if (!canPerform.success || !canPerform.allowed) {
        setError(canPerform.reason || 'You do not have permission to perform this action')
        return
      }

      const updateData: any = {
        status,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString()
      }

      if (status === 'rejected' && notes) {
        updateData.rejection_reason = notes
      }

      if (status === 'interview_scheduled' && notes) {
        updateData.interview_notes = notes
      }

      const { error } = await supabase
        .from('intern_applications')
        .update(updateData)
        .eq('id', applicationId)

      if (error) throw error

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, ...updateData } : app
        )
      )

             // Admin action is already logged through canPerformAdminAction

    } catch (error) {
      console.error('Error updating application:', error)
      setError('Failed to update application status')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'interview_scheduled': return <Calendar className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Applications</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchApplications} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Intern Applications</h1>
              <p className="text-gray-600">Review and manage intern applications</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600">
                  {applications.filter(app => app.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending Review</div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6">
                {applications.map((application) => (
            <Card key={application.id} className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {application.full_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {application.applicant_email}
                          </div>
                          {application.phone_number && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {application.phone_number}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Age: {calculateAge(application.date_of_birth)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="capitalize">{application.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="font-medium text-gray-700">Education</span>
                        </div>
                        <p className="text-sm text-gray-600">{application.education_level}</p>
                        <p className="text-sm text-gray-600">{application.school_institution}</p>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium text-gray-700">Areas of Interest</span>
                        </div>
                      <div className="flex flex-wrap gap-1">
                          {application.areas_of_interest.map((area, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
                        <span className="font-medium text-gray-700">Motivation Statement</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.motivation_statement}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Applied: {formatDate(application.submitted_at)}</span>
                      {application.reviewed_at && (
                        <span>Reviewed: {formatDate(application.reviewed_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application)
                        setShowDetails(true)
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>

                    {application.status === 'pending' && userPermissions?.can_manage_applications && (
                      <div className="flex flex-col space-y-1">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={actionLoading === application.id}
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                          >
                          {actionLoading === application.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          disabled={actionLoading === application.id}
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                          >
                          {actionLoading === application.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-1" />
                            Reject
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          disabled={actionLoading === application.id}
                          onClick={() => updateApplicationStatus(application.id, 'interview_scheduled')}
                        >
                          {actionLoading === application.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 mr-1" />
                              Schedule Interview
                            </>
                          )}
                        </Button>
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

          {applications.length === 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">There are currently no intern applications to review.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedApplication.applicant_email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedApplication.phone_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="text-gray-900">{formatDate(selectedApplication.date_of_birth)} (Age: {calculateAge(selectedApplication.date_of_birth)})</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Education Level</label>
                      <p className="text-gray-900">{selectedApplication.education_level}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">School/Institution</label>
                      <p className="text-gray-900">{selectedApplication.school_institution}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Areas of Interest */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas of Interest</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.areas_of_interest.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Previous Experience */}
                {selectedApplication.previous_experience && (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Previous Experience</h3>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.previous_experience}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Days per Week</label>
                      <p className="text-gray-900">{selectedApplication.availability.days_per_week}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Hours per Week</label>
                      <p className="text-gray-900">{selectedApplication.availability.hours_per_week}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Schedule</label>
                      <p className="text-gray-900">{selectedApplication.availability.preferred_schedule}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Motivation Statement */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Motivation Statement</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApplication.motivation_statement}</p>
                </div>

                {/* References */}
                {selectedApplication.references && selectedApplication.references.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">References</h3>
                      <div className="space-y-3">
                        {selectedApplication.references.map((reference, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900">{reference.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Relationship</label>
                                <p className="text-gray-900">{reference.relationship}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{reference.email}</p>
                              </div>
                              {reference.phone && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Phone</label>
                                  <p className="text-gray-900">{reference.phone}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Application Status */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <Badge className={`mt-1 ${getStatusColor(selectedApplication.status)}`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-1 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Submitted</label>
                      <p className="text-gray-900">{formatDate(selectedApplication.submitted_at)}</p>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reviewed</label>
                        <p className="text-gray-900">{formatDate(selectedApplication.reviewed_at)}</p>
                      </div>
                    )}
                    {selectedApplication.rejection_reason && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                        <p className="text-gray-900">{selectedApplication.rejection_reason}</p>
                      </div>
                    )}
                    {selectedApplication.interview_notes && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Interview Notes</label>
                        <p className="text-gray-900">{selectedApplication.interview_notes}</p>
            </div>
          )}
        </div>
      </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

