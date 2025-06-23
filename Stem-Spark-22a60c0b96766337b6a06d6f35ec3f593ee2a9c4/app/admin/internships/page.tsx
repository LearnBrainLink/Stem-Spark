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
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, Users, Calendar, RefreshCw, MapPin, Clock, Briefcase } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedInternshipsData } from '../enhanced-actions'

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

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    setIsLoading(true)
    const result = await getEnhancedInternshipsData()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
      setInternships([])
    } else if (result.internships) {
      setInternships(result.internships)
    }
    setIsLoading(false)
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

  const handleUpdateInternship = async (internshipId: string, internshipData: any) => {
    setIsLoading(true)
    setMessage(null)

    const result = await updateInternship(internshipId, internshipData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: "Internship updated successfully!" })
      fetchInternships()
    }

    setIsLoading(false)
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Internship Management</h1>
            <p className="text-gray-600">Create and manage internship opportunities for students.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchInternships}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Internship
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Internship</DialogTitle>
                  <DialogDescription>Add a new internship opportunity for students.</DialogDescription>
                </DialogHeader>
                <form action={handleCreateInternship} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" required />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" name="duration" placeholder="e.g., 3 months" required />
                  </div>
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea id="requirements" name="requirements" />
                  </div>
                  <div>
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input id="applicationDeadline" name="applicationDeadline" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input id="maxParticipants" name="maxParticipants" type="number" min="1" required />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">Create Internship</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.header>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Internships Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <InternshipCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No internships found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first internship opportunity.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {internships.map((internship, index) => (
            <InternshipCard key={internship.id} internship={internship} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
