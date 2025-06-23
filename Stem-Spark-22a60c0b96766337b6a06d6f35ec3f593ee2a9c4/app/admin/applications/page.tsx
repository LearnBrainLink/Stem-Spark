"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Users, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock, RefreshCw, Eye, Download, Filter } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedApplicationsData, updateApplicationStatus, createApplication, updateApplication, deleteApplication } from '../enhanced-actions'
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

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

  useEffect(() => {
    fetchApplications()
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
        setApplications([])
      } else if (result.applications) {
        setApplications(result.applications)
      }
    } catch (err) {
      setError('Failed to load applications')
      setApplications([])
    } finally {
      setIsLoading(false)
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
        <Button variant="ghost" size="sm">
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Application Management</h1>
            <p className="text-gray-600">Review and manage internship applications.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchApplications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div>
          <Label htmlFor="search">Search Applications</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by student name, internship title, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Applications Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ApplicationCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredApplications.map((application, index) => (
            <ApplicationCard key={application.id} application={application} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
