"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock, RefreshCw, Eye, Download, Filter, UserCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedApplicationsData, updateApplicationStatus, createApplication, updateApplication, deleteApplication, getEnhancedInternshipsData } from '../enhanced-actions'
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Application {
  id: string
  application_text: string
  status: string
  applied_at: string
  internships: {
    title: string
    company: string
  }
  profiles: {
    full_name: string
    email: string
    grade: number
    school_name: string
  }
  parent_info?: {
    parent_name: string
    parent_email: string
    parent_phone: string
    relationship: string
  }[]
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [internships, setInternships] = useState<any[]>([])
  const [internshipFilter, setInternshipFilter] = useState("all")

  useEffect(() => {
    fetchApplications()
    fetchInternships()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getEnhancedApplicationsData()
      
      if (result.error) {
        setError(result.error)
      } else if (result.applications) {
        setApplications(result.applications)
      }
    } catch (err) {
      setError('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInternships = async () => {
    try {
      const result = await getEnhancedInternshipsData()
      if (result.internships) {
        setInternships(result.internships)
      }
    } catch (err) {
      console.error('Failed to load internships:', err)
    }
  }

  const filterApplications = () => {
    let filtered = applications
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.internships?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.internships?.company?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }
    setFilteredApplications(filtered)
  }

  const updateApplicationStatusHandler = async (applicationId: string, newStatus: string) => {
    try {
      const result = await updateApplication(applicationId, { status: newStatus })
      if (!result.error) {
        fetchApplications()
      } else {
        console.error('Error updating application status:', result.error)
      }
    } catch (err) {
      console.error('Error updating application status:', err)
    }
  }

  const handleCreateApplication = async (applicationData: any) => {
    try {
      const result = await createApplication(applicationData)
      if (!result.error) {
        fetchApplications()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to create application' }
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return

    try {
      const result = await deleteApplication(applicationId)
      if (!result.error) {
        fetchApplications()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete application' }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "withdrawn": return "bg-gray-100 text-gray-800 border-gray-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />
      case "rejected": return <XCircle className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const ApplicationCard = ({ application, index }: { application: Application; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {application.profiles?.full_name || 'Unknown Applicant'}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              {application.internships?.title || 'Unknown Position'} at {application.internships?.company || 'Unknown Company'}
            </p>
            <div className="flex items-center gap-2">
              {getStatusIcon(application.status)}
              <Badge className={`text-xs px-2 py-1 ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{application.profiles?.email || 'No email'}</span>
          </div>
          {application.profiles?.grade && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-gray-400 flex items-center justify-center">🎓</span>
              <span>Grade {application.profiles.grade}</span>
            </div>
          )}
          {application.profiles?.school_name && (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-gray-400 flex items-center justify-center">🏫</span>
              <span>{application.profiles.school_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
          </div>
        </div>

        {application.application_text && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 line-clamp-3">
              {application.application_text}
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          {application.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => updateApplicationStatusHandler(application.id, 'approved')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => updateApplicationStatusHandler(application.id, 'rejected')}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(application)}>
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </Button>
      </div>
    </motion.div>
  )

  const ApplicationCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </motion.div>
  )

  const exportApplications = () => {
    const csvContent = [
      ['Applicant', 'Internship', 'Company', 'Status', 'Applied Date'],
      ...filteredApplications.map(application => [
        application.profiles?.full_name || 'Unknown',
        application.internships?.title || 'Unknown',
        application.internships?.company || 'Unknown',
        application.status,
        new Date(application.applied_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage internship applications</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={exportApplications} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchApplications} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
        <Select value={internshipFilter} onValueChange={setInternshipFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by internship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Internships</SelectItem>
            {internships.map((internship) => (
              <SelectItem key={internship.id} value={internship.id}>
                {internship.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Applications Table */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <ApplicationCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application, index) => (
            <ApplicationCard key={application.id} application={application} index={index} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find applications.</p>
          </CardContent>
        </Card>
      )}

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
              <DialogDescription>
                Review application information and take action.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Applicant</Label>
                  <p className="text-lg font-semibold">{selectedApplication.profiles?.full_name || 'Unknown Applicant'}</p>
                  <p className="text-gray-600">{selectedApplication.profiles?.email || 'No email'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Internship</Label>
                  <p className="text-lg font-semibold">{selectedApplication.internships?.title || 'Unknown Position'} at {selectedApplication.internships?.company || 'Unknown Company'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Cover Letter</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{selectedApplication.application_text || 'No cover letter'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Applied Date</Label>
                  <p className="text-gray-800">{new Date(selectedApplication.applied_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Badge className={getStatusColor(selectedApplication.status)}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {selectedApplication.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => updateApplicationStatusHandler(selectedApplication.id, 'approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => updateApplicationStatusHandler(selectedApplication.id, 'rejected')}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
