"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Check, X, Flag, MessageSquare, Video, FileText, AlertTriangle, Clock, Shield, RefreshCw, Download } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { getEnhancedVideosData, getEnhancedApplicationsData } from '../enhanced-actions'
import { supabase } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button as UiButton } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [error, setError] = useState<string | null>(null)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

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
      setError(null)
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
      setError("Failed to fetch content items")
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

  const filteredContent = filteredItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesType = typeFilter === "all" || item.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const exportContent = () => {
    const csvContent = [
      ['Type', 'Title', 'Author', 'Status', 'Created Date'],
      ...filteredContent.map(content => [
        content.type,
        content.title,
        content.author,
        content.status,
        new Date(content.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'post': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'comment': return 'bg-green-100 text-green-800 border-green-200'
      case 'video': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'flagged': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const ContentCard = ({ content, index }: { content: ContentItem; index: number }) => (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className={getTypeBadgeColor(content.type)}>
            {content.type}
          </Badge>
          <Badge className={getStatusBadgeColor(content.status)}>
            {content.status}
          </Badge>
        </div>
        <CardTitle className="text-lg">{content.title}</CardTitle>
        <CardDescription>by {content.author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 line-clamp-3">{content.content}</p>
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {new Date(content.created_at).toLocaleDateString()}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedContent(content)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ContentCardSkeleton = ({ index }: { index: number }) => (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--novakinetix-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">Review and moderate user-generated content</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={fetchContentItems} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportContent} className="w-full sm:w-auto">
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
              placeholder="Search content..."
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
            <SelectItem value="pending">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
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

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ContentCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((content, index) => (
            <ContentCard key={content.id} content={content} index={index} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find content.</p>
          </CardContent>
        </Card>
      )}

      {/* Content Review Dialog */}
      {selectedContent && (
        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Content Review</DialogTitle>
              <DialogDescription>
                Review content and take moderation action.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Author</Label>
                  <p className="text-lg font-semibold">{selectedContent.author}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Content Type</Label>
                  <Badge className={getTypeBadgeColor(selectedContent.type)}>
                    {selectedContent.type}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-gray-700">Content</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{selectedContent.content}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Created Date</Label>
                  <p className="text-gray-800">{new Date(selectedContent.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                  <Badge className={getStatusBadgeColor(selectedContent.status)}>
                    {selectedContent.status}
                  </Badge>
                </div>
              </div>
              
              {selectedContent.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => handleModerateContent(selectedContent.id, 'approve', selectedContent.type)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleModerateContent(selectedContent.id, 'reject', selectedContent.type)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


