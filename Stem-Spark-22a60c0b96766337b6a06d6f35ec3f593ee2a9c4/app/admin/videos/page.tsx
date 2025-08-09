"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Play, Clock, Video as VideoIcon, RefreshCw, Upload, Eye, Download, Search, AlertTriangle, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { VideoModal } from "@/components/ui/video-modal"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string | null
  duration: number
  category: string
  status: string
  created_at: string
  created_by: string
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setIsLoading(true)
    setMessage(null)
    setError(null)

    try {
      const response = await fetch('/api/admin/videos')
      if (!response.ok) {
        throw new Error('Failed to fetch videos')
      }
      const data = await response.json()
      setVideos(data.videos || [])
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Failed to load videos')
      setVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVideo = async (formData: FormData) => {
    try {
      setIsLoading(true)
      setMessage(null)
      setError(null)

      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const videoUrl = formData.get("url") as string
      const durationMinutes = formData.get("duration") as string
      const category = formData.get("category") as string
      if (!title || !description || !videoUrl || !durationMinutes || !category) {
        setError("All fields are required")
        return
      }

      const videoData = {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        duration: parseInt(durationMinutes) * 60, // Convert minutes to seconds
        category: category,
        status: "active",
        created_by: "admin" // TODO: Get from auth context
      }

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create video')
      }

      setMessage({ type: "success", text: "Video created successfully!" })
      setIsCreateDialogOpen(false)
      await fetchVideos()
    } catch (err) {
      console.error('Error creating video:', err)
      setError(err instanceof Error ? err.message : 'Failed to create video')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVideo = async (formData: FormData) => {
    if (!selectedVideo) return

    try {
      setIsLoading(true)
      setMessage(null)
      setError(null)

      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const videoUrl = formData.get("url") as string
      const durationMinutes = formData.get("duration") as string
      const category = formData.get("category") as string
      const status = formData.get("status") as string

      const updateData = {
        id: selectedVideo.id,
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        duration: parseInt(durationMinutes) * 60,
        category: category,
        status: status,
      }

      const response = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update video')
      }

      setMessage({ type: "success", text: "Video updated successfully!" })
      setIsEditDialogOpen(false)
      setSelectedVideo(null)
      await fetchVideos()
    } catch (err) {
      console.error('Error updating video:', err)
      setError(err instanceof Error ? err.message : 'Failed to update video')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      setIsLoading(true)
      setMessage(null)
      setError(null)

      const response = await fetch(`/api/admin/videos?id=${videoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete video')
      }

      setMessage({ type: "success", text: "Video deleted successfully!" })
      await fetchVideos()
    } catch (err) {
      console.error('Error deleting video:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete video')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
    const matchesStatus = statusFilter === "all" || video.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleWatchVideo = (video: Video) => {
    setSelectedVideo(video)
    setIsVideoModalOpen(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'stem': return 'bg-blue-100 text-blue-800'
      case 'technology': return 'bg-purple-100 text-purple-800'
      case 'science': return 'bg-green-100 text-green-800'
      case 'math': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading && videos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
          <p className="text-muted-foreground">Manage educational videos and content</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={fetchVideos} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>
                  Create a new educational video for students
                </DialogDescription>
              </DialogHeader>
              
              <form action={handleCreateVideo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="Video title" required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STEM">STEM</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Math">Math</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Video description" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Video URL</Label>
                    <Input id="url" name="url" type="url" placeholder="https://..." required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input id="duration" name="duration" type="number" min="1" placeholder="10" required />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Video"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="STEM">STEM</SelectItem>
            <SelectItem value="Technology">Technology</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Math">Math</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Videos Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {video.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getCategoryColor(video.category)}>
                        {video.category}
                      </Badge>
                      <Badge variant={video.status === 'active' ? 'default' : 'secondary'}>
                        {video.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedVideo(video)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVideo(video.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => handleWatchVideo(video)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Watch Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredVideos.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <VideoIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by adding your first video"}
            </p>
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setCategoryFilter("all")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Video
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update video information
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <form action={handleUpdateVideo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={selectedVideo.title}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={selectedVideo.category} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STEM">STEM</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Math">Math</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  name="description" 
                  defaultValue={selectedVideo.description}
                  required 
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-url">Video URL</Label>
                  <Input 
                    id="edit-url" 
                    name="url" 
                    type="url" 
                    defaultValue={selectedVideo.video_url}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input 
                    id="edit-duration" 
                    name="duration" 
                    type="number" 
                    min="1" 
                    defaultValue={Math.floor(selectedVideo.duration / 60)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedVideo.status} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    setSelectedVideo(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Video"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false)
            setSelectedVideo(null)
          }}
          video={selectedVideo}
        />
      )}
    </div>
  )
}