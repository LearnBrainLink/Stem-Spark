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
import Link from "next/link"
import Image from "next/image"
import { Video } from "@/app/actions"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [selectedVideoForPreview, setSelectedVideoForPreview] = useState<Video | null>(null)
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
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        setVideos([])
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching videos:', error)
        setError(error.message)
        setVideos([])
      } else {
        // Transform the data
        const transformedVideos = videos?.map(video => ({
          ...video,
          isActive: video.status === 'active',
          durationFormatted: video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00',
          categoryColor: video.category === 'STEM' ? 'blue' : 
                         video.category === 'Technology' ? 'purple' : 
                         video.category === 'Science' ? 'green' : 'gray',
        })) || []
        
        setVideos(transformedVideos)
        console.log('Videos loaded:', transformedVideos.length)
      }
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

      // Validate required fields
      const title = formData.get("title") as string
      const description = formData.get("description") as string
      const videoUrl = formData.get("url") as string // Note: form field is "url" not "videoUrl"
      const durationMinutes = formData.get("duration") as string
      const category = formData.get("category") as string

      if (!title || !description || !videoUrl || !durationMinutes || !category) {
        setError("All fields are required")
        return
      }

      const videoData = {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(), // Use video_url as expected by database
        duration: parseInt(durationMinutes) * 60, // Convert minutes to seconds
        category: category,
        status: "active",
      }

      console.log('Creating video with data:', videoData)

      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single()

      if (error) {
        console.error('Error creating video:', error)
        setError(error.message)
      } else {
        setMessage({ type: "success", text: "Video created successfully!" })
        setIsCreateDialogOpen(false)
        fetchVideos() // Refresh the list
      }
    } catch (err) {
      console.error('Error in handleCreateVideo:', err)
      setError('Failed to create video')
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

      if (!title || !description || !videoUrl || !durationMinutes || !category || !status) {
        setError("All fields are required")
        return
      }

      const videoData = {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        duration: parseInt(durationMinutes) * 60,
        category: category,
        status: status,
        updated_at: new Date().toISOString(),
      }

      console.log('Updating video with data:', videoData)

      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { data, error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', selectedVideo.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating video:', error)
        setError(error.message)
      } else {
        setMessage({ type: "success", text: "Video updated successfully!" })
        setIsEditDialogOpen(false)
        setSelectedVideo(null)
        fetchVideos() // Refresh the list
      }
    } catch (err) {
      console.error('Error in handleUpdateVideo:', err)
      setError('Failed to update video')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      setIsLoading(true)
      setMessage(null)
      setError(null)

      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId)

      if (error) {
        console.error('Error deleting video:', error)
        setError(error.message)
      } else {
        setMessage({ type: "success", text: "Video deleted successfully!" })
        fetchVideos() // Refresh the list
      }
    } catch (err) {
      console.error('Error in handleDeleteVideo:', err)
      setError('Failed to delete video')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatDurationMinutes = (seconds: number) => {
    if (!seconds || seconds === 0) return 0
    return Math.round(seconds / 60)
  }

  const handleVideoPreview = (video: Video) => {
    setSelectedVideoForPreview(video)
    setIsVideoModalOpen(true)
  }

  const getEmbedUrl = (url: string) => {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url)
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    // Handle Vimeo URLs
    if (url.includes('vimeo.com')) {
      const videoId = extractVimeoId(url)
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url
    }
    // Return original URL for other platforms
    return url
  }

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[7].length === 11) ? match[7] : null
  }

  const extractVimeoId = (url: string) => {
    const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  const VideoCard = ({ video, index }: { video: Video; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-video bg-gray-200 relative cursor-pointer group" onClick={() => handleVideoPreview(video)} title="Click to watch video">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration ? formatDuration(video.duration) : '0:00'}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-t-lg" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{video.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{video.description}</p>
            <Badge className={`text-xs px-2 py-1 ${video.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
              {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <VideoIcon className="w-4 h-4 text-gray-400" />
            <span>Video ID: {video.id.slice(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Created: {new Date(video.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSelectedVideo(video); setIsEditDialogOpen(true); }}>
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeleteVideo(video.id)}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
        <Button size="sm" onClick={() => handleVideoPreview(video)}>
          <Eye className="w-4 h-4 mr-1" />
          Preview
        </Button>
      </div>
    </motion.div>
  )

  const VideoCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="aspect-video">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </motion.div>
  )

  const exportVideos = () => {
    const csvContent = [
      ['Title', 'Description', 'Category', 'Duration', 'Status', 'Created'],
      ...filteredVideos.map(video => [
        video.title,
        video.description,
        video.category,
        `${video.duration} min`,
        video.status,
        new Date(video.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || video.category === categoryFilter
    const matchesStatus = statusFilter === "all" || video.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
          <p className="text-gray-600 mt-1">Upload, manage, and organize educational videos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Video</DialogTitle>
                <DialogDescription>
                  Add a new educational video to the platform.
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateVideo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter video title..." 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea 
                    id="description" 
                    name="description" 
                    placeholder="Enter video description..."
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Video URL</Label>
                  <Input 
                    id="url" 
                    name="url" 
                    type="url" 
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    name="duration" 
                    type="number" 
                    min="1" 
                    max="300"
                    placeholder="e.g., 15"
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Upload Video'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportVideos} className="w-full sm:w-auto">
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
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="mathematics">Mathematics</SelectItem>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
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

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <VideoCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find videos.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Video Dialog */}
      {selectedVideo && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>
                Update video information and settings.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpdateVideo} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Video Title</Label>
                <Input 
                  id="edit-title" 
                  name="title" 
                  defaultValue={selectedVideo.title} 
                  placeholder="Enter video title..."
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea 
                  id="edit-description" 
                  name="description" 
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  defaultValue={selectedVideo.description}
                  placeholder="Enter video description..."
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-url">Video URL</Label>
                <Input 
                  id="edit-url" 
                  name="url" 
                  type="url" 
                  defaultValue={selectedVideo.video_url} 
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
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
                  max="300"
                  defaultValue={formatDurationMinutes(selectedVideo.duration)} 
                  placeholder="e.g., 15"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select name="category" defaultValue={selectedVideo.category} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Video'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Preview Modal */}
      {selectedVideoForPreview && (
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {selectedVideoForPreview.title}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedVideoForPreview.description}
              </DialogDescription>
            </DialogHeader>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe
                src={getEmbedUrl(selectedVideoForPreview.video_url)}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={selectedVideoForPreview.title}
              />
            </div>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {selectedVideoForPreview.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(selectedVideoForPreview.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedVideoForPreview.created_at).toLocaleDateString()}
                </span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsVideoModalOpen(false)}
                className="flex items-center gap-2"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
