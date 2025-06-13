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
    <div className="w-full h-screen max-w-6xl mx-auto p-2 md:p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm rounded-lg mb-4 py-2 px-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="text-lg font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Internship Applications
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">Admin Dashboard</Button>
            </Link>
            <Link href="/admin/internships">
              <Button variant="outline" size="sm">Manage Internships</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">Internship Applications</h1>
        <p className="text-gray-600 text-xs md:text-sm">Review and manage student applications for internships</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student name, internship, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 py-1 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="text-sm">
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
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <Users className="w-4 h-4" />
          <span>{filteredApplications.length} applications</span>
        </div>
      </div>

      {/* Applications List - compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: '60vh' }}>
        {filteredApplications.map((application) => (
          <Card key={application.id} className="border-0 shadow rounded bg-white p-2">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold mb-0 truncate">{application.profiles?.full_name}</CardTitle>
                  <Badge className={getStatusColor(application.status) + ' capitalize text-xs px-2 py-0.5'}>{application.status}</Badge>
                </div>
                <CardDescription className="text-xs text-gray-500 truncate">
                  {application.internships?.title} at {application.internships?.company}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-gray-400" />
                  <span>{application.profiles?.email}</span>
                </div>
                {application.profiles?.grade && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 text-gray-400">🎓</span>
                    <span>Grade {application.profiles.grade}</span>
                  </div>
                )}
                {application.profiles?.school_name && (
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 text-gray-400">🏫</span>
                    <span>{application.profiles.school_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                </div>
                {application.parent_info && application.parent_info.length > 0 && (
                  <div className="mt-1">
                    <span className="font-medium">Parent:</span> {application.parent_info[0].parent_name} ({application.parent_info[0].relationship})
                  </div>
                )}
                <div className="bg-gray-50 p-2 rounded mt-1 min-h-[2em]">
                  <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-3">{application.application_text}</p>
                </div>
                {application.status === "pending" && (
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" onClick={() => updateApplicationStatus(application.id, "approved")} className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1">Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => updateApplicationStatus(application.id, "rejected")} className="text-xs px-2 py-1">Reject</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No Applications Found</h3>
          <p className="text-gray-500 text-xs">
            {searchTerm || statusFilter !== "all"
              ? "No applications match your current filters."
              : "No internship applications have been submitted yet."}
          </p>
        </div>
      )}
    </div>
  )
}
