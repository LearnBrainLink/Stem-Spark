"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Search, Users, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

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

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("internship_applications")
      .select(`
        *,
        internships(title, company),
        profiles(full_name, email, grade, school_name)
      `)
      .order("applied_at", { ascending: false })

    if (data) {
      // Fetch parent info for each student
      const applicationsWithParents = await Promise.all(
        data.map(async (app) => {
          const { data: parentInfo } = await supabase.from("parent_info").select("*").eq("student_id", app.student_id)

          return {
            ...app,
            parent_info: parentInfo,
          }
        }),
      )

      setApplications(applicationsWithParents)
    }
    setIsLoading(false)
  }

  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.internships?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.internships?.company.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    setFilteredApplications(filtered)
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("internship_applications")
      .update({ status: newStatus })
      .eq("id", applicationId)

    if (!error) {
      fetchApplications()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Internship Applications
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
            <Link href="/admin/internships">
              <Button variant="outline">Manage Internships</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Internship Applications</h1>
          <p className="text-gray-600">Review and manage student applications for internships</p>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name, internship, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{filteredApplications.length} applications</span>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id} className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{application.profiles?.full_name}</CardTitle>
                    <CardDescription className="text-base">
                      Applied for: {application.internships?.title} at {application.internships?.company}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                    {application.status === "pending" && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => updateApplicationStatus(application.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateApplicationStatus(application.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{application.profiles?.email}</span>
                      </div>
                      {application.profiles?.grade && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-gray-400">🎓</span>
                          <span>Grade {application.profiles.grade}</span>
                        </div>
                      )}
                      {application.profiles?.school_name && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-gray-400">🏫</span>
                          <span>{application.profiles.school_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Parent Information */}
                    {application.parent_info && application.parent_info.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Parent/Guardian Contact</h5>
                        {application.parent_info.map((parent, index) => (
                          <div key={index} className="space-y-1 text-sm">
                            <p className="font-medium">{parent.parent_name}</p>
                            <p className="text-gray-600 capitalize">{parent.relationship}</p>
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{parent.parent_email}</span>
                            </div>
                            {parent.parent_phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{parent.parent_phone}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Application Text */}
                  <div>
                    <h4 className="font-semibold mb-3">Application Statement</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.application_text}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Applications Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "No applications match your current filters."
                : "No internship applications have been submitted yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
