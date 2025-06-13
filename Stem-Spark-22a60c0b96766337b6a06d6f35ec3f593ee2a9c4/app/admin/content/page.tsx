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
import { Search, Eye, Check, X, Flag, MessageSquare, Video, FileText, AlertTriangle, Clock } from "lucide-react"

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
      const videoItems: ContentItem[] = (videos || []).map((video) => ({
        id: video.id,
        type: "video" as const,
        title: video.title,
        content: video.description || "",
        author: video.profiles?.full_name || "Unknown",
        status: video.status === "active" ? "approved" : "pending",
        created_at: video.created_at,
      }))

      const applicationItems: ContentItem[] = (applications || []).map((app) => ({
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
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case "flagged":
        return <Badge className="bg-orange-100 text-orange-800">Flagged</Badge>
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen max-w-7xl mx-auto p-2 md:p-4 space-y-4 overflow-hidden">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-secondary">Total Content</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.total}</p>
              </div>
              <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center shadow-brand">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-secondary">Pending</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-brand">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-secondary">Approved</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-brand">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-secondary">Rejected</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-brand">
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-secondary">Flagged</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.flagged}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-brand">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert className={`mt-1 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Content Moderation */}
      <Card className="admin-card shadow-md border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Content Moderation</CardTitle>
          <CardDescription className="text-sm">Review and moderate user-generated content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search content by title, content, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 py-1 text-sm"
              />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-2 text-xs">
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                <TabsTrigger value="flagged">Flagged ({stats.flagged})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-2">
                <div className="border rounded-lg overflow-x-auto bg-white shadow-sm" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Content</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={`${item.type}-${item.id}`}>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="font-medium truncate">{item.title}</p>
                              <p className="text-sm text-gray-500 truncate">{item.content}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.type)}
                              <span className="capitalize">{item.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {item.status === "pending" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleModerateContent(item.id, "approve", item.type)}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleModerateContent(item.id, "reject", item.type)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleModerateContent(item.id, "flag", item.type)}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <Flag className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-1">No Content Found</h3>
                    <p className="text-gray-500 text-xs">
                      {searchTerm || activeTab !== "all"
                        ? "No content matches your current filters."
                        : "No content has been submitted yet."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
