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
import { createInternship } from "@/lib/internship-actions"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, Users, Calendar } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

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

export default function AdminInternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false })

    if (data) {
      setInternships(data)
    }
  }

  const handleCreateInternship = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await createInternship(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: "Internship created successfully!" })
      setIsCreateDialogOpen(false)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Manage Internships
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 h-[calc(100vh-72px)] flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 shrink-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Internships</h1>
            <p className="text-gray-600 text-base md:text-lg">Create and manage internship opportunities for students</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md">
                <Plus className="w-5 h-5 mr-2" />
                Create Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Internship</DialogTitle>
                <DialogDescription>Add a new internship opportunity for students to apply to</DialogDescription>
              </DialogHeader>

              <form action={handleCreateInternship} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" name="title" placeholder="Software Engineering Intern" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input id="company" name="company" placeholder="Tech Corp" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe the internship opportunity..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" name="location" placeholder="San Francisco, CA" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input id="duration" name="duration" placeholder="8 weeks" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="List the requirements for this internship..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                    <Input id="applicationDeadline" name="applicationDeadline" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input id="endDate" name="endDate" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="10"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Creating..." : "Create Internship"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert className={`mb-2 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} shrink-0`}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Internships List - scrollable, compact */}
        <div className="flex-1 min-h-0 overflow-auto space-y-4 pr-1">
          {internships.map((internship) => (
            <Card key={internship.id} className="border-0 shadow-md rounded-lg bg-white">
              <CardHeader className="py-2 px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1 line-clamp-2">{internship.title}</CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      {internship.company} • {internship.location}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={internship.status === "active" ? "default" : "secondary"} className="capitalize text-xs px-2 py-1">
                      {internship.status}
                    </Badge>
                    <Button variant="outline" size="sm" className="p-1 h-7 w-7"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" className="p-1 h-7 w-7"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-gray-600 mb-2 text-xs min-h-[2em] line-clamp-2">{internship.description}</p>
                <div className="grid md:grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /><span>Deadline: {formatDate(internship.application_deadline)}</span></div>
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-gray-400" /><span>Duration: {internship.duration}</span></div>
                  <div className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-400" /><span>{internship.current_participants}/{internship.max_participants} participants</span></div>
                  <div className="text-gray-500">Created: {formatDate(internship.created_at)}</div>
                </div>
              </CardContent>
            </Card>
          ))}

          {internships.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base mb-3">No internships created yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md text-sm px-4 py-2">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Internship
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
