"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createInternship, updateInternship, deleteInternship } from '../enhanced-actions'
import { supabase } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Users, Calendar, RefreshCw, MapPin, Clock, Briefcase, Download, Search } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedInternshipsData } from '../enhanced-actions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"

interface Internship {
  id: string
  title: string
  description: string
  company: string
  location: string
  duration: string
  requirements: string
  application_deadline: string
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  status: string
  created_at: string
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null)

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setMessage(null)
      
      const result = await getEnhancedInternshipsData()
      
      if (result.error) {
        setError(result.error)
        setInternships([])
      } else if (result.internships) {
        setInternships(result.internships)
        console.log('Internships loaded:', result.internships.length)
      }
    } catch (err) {
      console.error('Error fetching internships:', err)
      setError('Failed to load internships')
      setInternships([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInternship = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const internshipData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      company: formData.get("company") as string,
      location: formData.get("location") as string,
      duration: formData.get("duration") as string,
      requirements: formData.get("requirements") as string,
      application_deadline: formData.get("applicationDeadline") as string,
      start_date: formData.get("startDate") as string,
      end_date: formData.get("endDate") as string,
      max_participants: Number(formData.get("maxParticipants")),
      current_participants: 0,
      status: "active",
    }

    const result = await createInternship(internshipData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: "Internship created successfully!" })
      setIsCreateDialogOpen(false)
      fetchInternships()
    }

    setIsLoading(false)
  }

  const handleUpdateInternship = async (formData: FormData) => {
    if (!editingInternship) return

    try {
      const internshipData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        company: formData.get("company") as string,
        location: formData.get("location") as string,
        duration: Number(formData.get("duration")),
        requirements: formData.get("requirements") as string,
      }

      await updateInternship(editingInternship.id, internshipData)
      setMessage({ type: "success", text: "Internship updated successfully!" })
      setEditingInternship(null)
      fetchInternships()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update internship" })
    }
  }

  const handleDeleteInternship = async (internshipId: string) => {
    if (!confirm("Are you sure you want to delete this internship?")) return

    setIsLoading(true)
    setMessage(null)

    const result = await deleteInternship(internshipId)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: "Internship deleted successfully!" })
      fetchInternships()
    }

    setIsLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const InternshipCard = ({ internship, index }: { internship: Internship; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{internship.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{internship.company}</p>
            <Badge className={`text-xs px-2 py-1 ${internship.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{internship.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{internship.duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{internship.current_participants}/{internship.max_participants} participants</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">{internship.description}</p>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button size="sm">View Applications</Button>
      </div>
    </motion.div>
  )

  const InternshipCardSkeleton = ({ index }: { index: number }) => (
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
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
    </motion.div>
  )

  const exportInternships = () => {
    const csvContent = [
      ['Title', 'Company', 'Location', 'Duration', 'Status', 'Created'],
      ...filteredInternships.map(internship => [
        internship.title,
        internship.company,
        internship.location,
        `${internship.duration} weeks`,
        internship.status,
        new Date(internship.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internships-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || internship.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internship Management</h1>
          <p className="text-gray-600 mt-1">Create and manage internship programs</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
                <DialogDescription>
                  Add a new internship program to the platform.
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateInternship} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Internship Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (weeks)</Label>
                    <Input id="duration" name="duration" type="number" min="1" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <textarea 
                    id="requirements" 
                    name="requirements" 
                    className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Create Internship</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportInternships} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search internships..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="business">Business</SelectItem>
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

      {/* Internships Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <InternshipCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : filteredInternships.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((internship, index) => (
            <InternshipCard key={internship.id} internship={internship} index={index} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find internships.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Internship Dialog */}
      {editingInternship && (
        <Dialog open={!!editingInternship} onOpenChange={() => setEditingInternship(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Internship</DialogTitle>
              <DialogDescription>
                Update internship information and settings.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpdateInternship} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Internship Title</Label>
                <Input id="edit-title" name="title" defaultValue={editingInternship.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea 
                  id="edit-description" 
                  name="description" 
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={editingInternship.description}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company</Label>
                <Input id="edit-company" name="company" defaultValue={editingInternship.company} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input id="edit-location" name="location" defaultValue={editingInternship.location} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (weeks)</Label>
                  <Input id="edit-duration" name="duration" type="number" min="1" defaultValue={editingInternship.duration} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-requirements">Requirements</Label>
                <textarea 
                  id="edit-requirements" 
                  name="requirements" 
                  className="w-full min-h-[80px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue={editingInternship.requirements || ''}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Update Internship</Button>
                <Button type="button" variant="outline" onClick={() => setEditingInternship(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
