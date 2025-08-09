'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Application {
  id: string
  email: string
  full_name: string
  phone: string | null
  grade: number
  school: string
  specialties: string[]
  experience: string | null
  availability: string
  motivation: string
  bio: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/applications')
      if (!response.ok) {
        throw new Error('Failed to fetch applications')
      }
      
      const data = await response.json()
      console.log('Applications loaded:', data.applications?.length || 0)
      setApplications(data.applications || [])
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string, reason?: string, notes?: string) => {
    try {
      setActionLoading(applicationId)
      setError(null)

      const updateData = {
        id: applicationId,
        status: newStatus,
        reviewed_by: 'admin', // TODO: Get from auth context
        rejection_reason: reason,
        interview_notes: notes
      }

      const response = await fetch('/api/admin/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update application')
      }

      setSuccess(`Application ${newStatus} successfully!`)
      setShowDetails(false)
      setSelectedApplication(null)
      await fetchApplications()
    } catch (error) {
      console.error('Error updating application status:', error)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  )

  if (loading && applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
          <p className="text-muted-foreground">Review and manage internship applications</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchApplications} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(app => app.status === 'interview_scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applications found</h3>
            <p className="text-muted-foreground text-center">
              {statusFilter !== 'all' 
                ? `No applications with status "${statusFilter}"`
                : 'No applications have been submitted yet'
              }
            </p>
            {statusFilter !== 'all' && (
              <Button 
                variant="outline" 
                onClick={() => setStatusFilter('all')}
                className="mt-4"
              >
                Show All Applications
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">
                      {application.full_name}
                    </CardTitle>
                                      <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {application.email}
                    </span>
                  </div>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <span>Grade {application.grade}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="line-clamp-1">{application.school}</span>
                  </div>
                  
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{application.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>Applied {formatDate(application.created_at)}</span>
                  </div>
                </div>
                
                {application.specialties && application.specialties.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Specialties:</span>
                    <div className="flex flex-wrap gap-1">
                      {application.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {application.specialties.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{application.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedApplication(application)
                      setShowDetails(true)
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  
                  {application.status === 'pending' && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        disabled={actionLoading === application.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                        disabled={actionLoading === application.id}
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Application Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <p className="text-sm">{selectedApplication.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Grade</Label>
                    <p className="text-sm">Grade {selectedApplication.grade}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Education</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">School</Label>
                    <p className="text-sm">{selectedApplication.school}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm">{selectedApplication.bio}</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              {selectedApplication.specialties && selectedApplication.specialties.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Motivation</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedApplication.motivation}</p>
                </div>
              </div>

              {/* Experience */}
              {selectedApplication.experience && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedApplication.experience}</p>
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{selectedApplication.availability}</p>
                </div>
              </div>

              {/* Application Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">Current Status:</Label>
                    <Badge className={getStatusColor(selectedApplication.status)}>
                      {selectedApplication.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {selectedApplication.status === 'pending' && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                          disabled={actionLoading === selectedApplication.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Application
                        </Button>
                        
                        <Button
                          onClick={() => updateApplicationStatus(selectedApplication.id, 'interview_scheduled')}
                          disabled={actionLoading === selectedApplication.id}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Interview
                        </Button>
                        
                        <Button
                          variant="destructive"
                          onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                          disabled={actionLoading === selectedApplication.id}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Application
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.reviewed_by && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <Label className="text-sm font-medium">Reviewed By</Label>
                        <p className="text-sm">{selectedApplication.reviewed_by}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Reviewed At</Label>
                        <p className="text-sm">
                          {selectedApplication.reviewed_at ? formatDate(selectedApplication.reviewed_at) : 'Not reviewed'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {selectedApplication.rejection_reason && (
                    <div>
                      <Label className="text-sm font-medium">Rejection Reason</Label>
                      <p className="text-sm">{selectedApplication.rejection_reason}</p>
                    </div>
                  )}
                  
                  {selectedApplication.interview_notes && (
                    <div>
                      <Label className="text-sm font-medium">Interview Notes</Label>
                      <p className="text-sm">{selectedApplication.interview_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}