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
import { Plus, Edit, Trash2, Play, Clock, Video as VideoIcon, RefreshCw, Upload, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Video } from "@/app/actions"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedVideosData, updateVideoStatus, createVideo, updateVideo, deleteVideo } from '../enhanced-actions'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    setIsLoading(true)
    const result = await getEnhancedVideosData()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
      setVideos([])
    } else if (result.videos) {
      setVideos(result.videos)
    }
    setIsLoading(false)
  }

  const handleCreateVideo = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const videoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("videoUrl") as string,
      duration: formData.get("duration") ? Number(formData.get("duration")) : 0,
      category: formData.get("category") as string,
      status: "active",
    }

    const result = await createVideo(videoData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Video created successfully!" })
      setIsCreateDialogOpen(false)
      fetchVideos()
    }

    setIsLoading(false)
  }

  const handleUpdateVideo = async (formData: FormData) => {
    if (!selectedVideo) return

    setIsLoading(true)
    setMessage(null)

    const videoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("videoUrl") as string,
      duration: formData.get("duration") ? Number(formData.get("duration")) : 0,
      category: formData.get("category") as string,
      status: formData.get("status") as string,
    }

    const result = await updateVideo(selectedVideo.id, videoData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Video updated successfully!" })
      setIsEditDialogOpen(false)
      fetchVideos()
    }

    setIsLoading(false)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    const result = await deleteVideo(videoId)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Video deleted successfully!" })
      fetchVideos()
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const VideoCard = ({ video, index }: { video: Video; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="aspect-video bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-400" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration ? formatDuration(video.duration) : '0:00'}
        </div>
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
        <Button size="sm">
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Video Management</h1>
            <p className="text-gray-600">Upload and manage educational videos.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchVideos}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Video</DialogTitle>
                  <DialogDescription>Upload a new educational video to the platform.</DialogDescription>
                </DialogHeader>
                <form action={handleCreateVideo} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <div>
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <Input id="videoUrl" name="videoUrl" type="url" required />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input id="duration" name="duration" type="number" />
                  </div>
                  <div>
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
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">Add Video</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <VideoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding your first video.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {videos.map((video, index) => (
            <VideoCard key={video.id} video={video} index={index} />
          ))}
        </motion.div>
      )}

      {/* Edit Video Dialog */}
      {selectedVideo && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Update video information.</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateVideo} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input id="edit-title" name="title" defaultValue={selectedVideo.title} required />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={selectedVideo.description} />
              </div>
              <div>
                <Label htmlFor="edit-videoUrl">Video URL</Label>
                <Input id="edit-videoUrl" name="videoUrl" type="url" defaultValue={selectedVideo.video_url} required />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (seconds)</Label>
                <Input id="edit-duration" name="duration" type="number" defaultValue={selectedVideo.duration} />
              </div>
              <div>
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
              <div>
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
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Update Video</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
