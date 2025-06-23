"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Check, X, Flag, MessageSquare, Video, FileText, AlertTriangle, Clock, Shield, RefreshCw } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { getEnhancedVideosData, getEnhancedApplicationsData } from '../enhanced-actions'
import { supabase } from '@/lib/supabase'

interface ContentItem {
  id: string
  type: "video" | "application" | "comment"
  title: string
  content: string
  author: string
  status: "pending" | "approved" | "rejected" | "flagged"
  created_at: string
  flagged_reason?: string
}

export default function ContentModerationPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchContentItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [contentItems, searchTerm, activeTab])

  const fetchContentItems = async () => {
    try {
      setIsLoading(true)
      setMessage(null)
      // Fetch videos
      const videosResult = await getEnhancedVideosData()
      // Fetch applications
      const applicationsResult = await getEnhancedApplicationsData()
      // Transform data
      const videoItems: ContentItem[] = (videosResult.videos || []).map((video: any) => ({
        id: video.id,
        type: "video" as const,
        title: video.title,
        content: video.description || "",
        author: video.uploader_name || video.uploader_email || "Unknown",
        status: video.status === "active" ? "approved" : "pending",
        created_at: video.created_at,
      }))
      const applicationItems: ContentItem[] = (applicationsResult.applications || []).map((app: any) => ({
        id: app.id,
        type: "application" as const,
        title: `Application for ${app.internshipTitle || "Unknown Position"}`,
        content: app.application_text,
        author: app.studentName || "Unknown",
        status: app.status === "approved" ? "approved" : app.status === "rejected" ? "rejected" : "pending",
        created_at: app.applied_at,
      }))
      const allItems = [...videoItems, ...applicationItems]
      setContentItems(allItems)
    } catch (error) {
      console.error("Error fetching content:", error)
      setMessage({ type: "error", text: "Failed to fetch content items" })
    } finally {
      setIsLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = contentItems

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.status === activeTab)
    }

    setFilteredItems(filtered)
  }

  const handleModerateContent = async (itemId: string, action: "approve" | "reject" | "flag", type: string) => {
    try {
      const updateData: any = {}

      if (action === "approve") {
        updateData.status = type === "video" ? "active" : "approved"
      } else if (action === "reject") {
        updateData.status = "rejected"
      } else if (action === "flag") {
        updateData.status = "flagged"
      }

      const table = type === "video" ? "videos" : "internship_applications"

      const { error } = await supabase.from(table).update(updateData).eq("id", itemId)

      if (error) throw error

      setMessage({ type: "success", text: `Content ${action}d successfully!` })
      fetchContentItems()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || `Failed to ${action} content` })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      case "flagged":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Flagged</Badge>
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "application":
        return <FileText className="w-4 h-4" />
      case "comment":
        return <MessageSquare className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const stats = {
    total: contentItems.length,
    pending: contentItems.filter((item) => item.status === "pending").length,
    approved: contentItems.filter((item) => item.status === "approved").length,
    rejected: contentItems.filter((item) => item.status === "rejected").length,
    flagged: contentItems.filter((item) => item.status === "flagged").length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--novakinetix-primary)]"></div>
      </div>
    )
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Content Moderation</h1>
            <p className="text-gray-600">Review and manage platform content effectively.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchContentItems}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
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

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Content */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Content Table */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.author}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerateContent(item.id, "approve", item.type)}
                          disabled={item.status === "approved"}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerateContent(item.id, "reject", item.type)}
                          disabled={item.status === "rejected"}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleModerateContent(item.id, "flag", item.type)}
                          disabled={item.status === "flagged"}
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


