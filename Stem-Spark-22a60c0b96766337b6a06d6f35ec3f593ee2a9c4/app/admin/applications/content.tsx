"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { Search, Users, Calendar, Mail, Phone } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

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

export default function ApplicationsPageContent() {
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
      const applicationsWithParents = await Promise.all(
        data.map(async (app: any) => {
          const { data: parentInfo } = await supabase.from("parent_info").select("*").eq("student_id", app.student_id)
          return { ...app, parent_info: parentInfo }
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
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "withdrawn": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-gray-600 mt-4">Loading applications...</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 p-2 sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Applications</h1>
            <p className="text-gray-600">Manage and review internship applications efficiently.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filteredApplications.map((application) => (
          <Card key={application.id} className="border-0 shadow-md rounded-lg bg-white">
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
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  )
} 