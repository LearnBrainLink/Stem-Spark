"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { Search, Eye, Check, X, Flag, MessageSquare, Video, FileText, AlertTriangle, Clock, Shield } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

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

export default function ContentModerationPageContent() {
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
      // Fetch videos
      const { data: videos } = await supabase.from("videos").select(`
          id,
          title,
          description,
          status,
          created_at,
          profiles(full_name)
        `)

      // Fetch internship applications
      const { data: applications } = await supabase.from("internship_applications").select(`
          id,
          application_text,
          status,
          applied_at,
          profiles(full_name),
          internships(title)
        `)

      // Transform data
      const videoItems: ContentItem[] = (videos || []).map((video: any) => ({
        id: video.id,
        type: "video" as const,
        title: video.title,
        content: video.description || "",
        author: video.profiles?.full_name || "Unknown",
        status: video.status === "active" ? "approved" : "pending",
        created_at: video.created_at,
      }))

      const applicationItems: ContentItem[] = (applications || []).map((app: any) => ({
        id: app.id,
        type: "application" as const,
        title: `Application for ${app.internships?.title || "Unknown Position"}`,
        content: app.application_text,
        author: app.profiles?.full_name || "Unknown",
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
            <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Content Moderation</h1>
            <p className="text-gray-600">Review and manage platform content effectively.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              Refresh
            </Button>
          </div>
        </div>
      </motion.header>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Content</p>
                <p className="text-2xl font-bold text-[var(--novakinetix-dark)]">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--novakinetix-primary)] to-[var(--novakinetix-accent)] rounded-lg flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-orange-600">{stats.flagged}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Flag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search content, authors, or titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-[var(--novakinetix-primary)] focus:ring-[var(--novakinetix-primary)]"
                  />
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[var(--novakinetix-primary)] data-[state=active]:text-white">All</TabsTrigger>
                  <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">Pending</TabsTrigger>
                  <TabsTrigger value="approved" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Approved</TabsTrigger>
                  <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Rejected</TabsTrigger>
                  <TabsTrigger value="flagged" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">Flagged</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[var(--novakinetix-dark)]">
              Content Items ({filteredItems.length})
            </CardTitle>
            <CardDescription>
              Review and moderate user-generated content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-500">No content items match your current filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                  <TableHead>
                    <TableRow>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableCell>
                      <TableCell className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="bg-white">
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.author}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button variant="link" className="text-blue-600 hover:text-blue-900" onClick={() => handleModerateContent(item.id, 'approve', item.type)}>Approve</Button>
                          <Button variant="link" className="text-red-600 hover:text-red-900 ml-2" onClick={() => handleModerateContent(item.id, 'reject', item.type)}>Reject</Button>
                          <Button variant="link" className="text-yellow-600 hover:text-yellow-900 ml-2" onClick={() => handleModerateContent(item.id, 'flag', item.type)}>Flag</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
} 