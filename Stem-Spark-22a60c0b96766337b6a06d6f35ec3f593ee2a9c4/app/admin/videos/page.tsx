"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Play, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Video, createVideo, updateVideo, deleteVideo, getVideos } from "@/app/actions"
import AdminLayout from '../layout'

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const result = await getVideos()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result.videos) {
      // Map and filter to ensure only valid Video objects are set
      const validVideos = (Array.isArray(result.videos)
        ? result.videos.filter((v: any) => v && typeof v.id === "string" && typeof v.title === "string" && typeof v.video_url === "string")
        : []) as Video[];
      setVideos(validVideos)
    }
  }

  const handleCreateVideo = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await createVideo(formData)

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

    const result = await updateVideo(selectedVideo.id, formData)

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

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Video management content */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Manage Videos</h1>
            <p className="text-gray-600 text-base md:text-lg">Upload and manage learning video content</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md">
                <Plus className="w-5 h-5 mr-2" />
                Add Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Video</DialogTitle>
                <DialogDescription>Upload a new learning video for students</DialogDescription>
              </DialogHeader>

              <form action={handleCreateVideo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" placeholder="Introduction to Robotics" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe what students will learn..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL *</Label>
                    <Input id="videoUrl" name="videoUrl" placeholder="https://youtube.com/watch?v=..." required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://example.com/thumbnail.jpg" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds) *</Label>
                    <Input id="duration" name="duration" type="number" placeholder="300" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Robotics">Robotics</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level *</Label>
                    <Select name="gradeLevel" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5th Grade</SelectItem>
                        <SelectItem value="6">6th Grade</SelectItem>
                        <SelectItem value="7">7th Grade</SelectItem>
                        <SelectItem value="8">8th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Adding..." : "Add Video"}
                  </Button>
                  <Button type="button" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert className={`mb-8 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className="border-0 shadow-xl rounded-xl overflow-hidden bg-white">
              <CardHeader className="p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-800">{video.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setSelectedVideo(video)
                        setIsEditDialogOpen(true)
                      }}
                      className="bg-transparent hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDeleteVideo(video.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Play className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className="text-sm">
                    {video.category}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(video.duration)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Video Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Video</DialogTitle>
              <DialogDescription>Update video information</DialogDescription>
            </DialogHeader>

            {selectedVideo && (
              <form action={handleUpdateVideo} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    defaultValue={selectedVideo.title}
                    placeholder="Introduction to Robotics"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    defaultValue={selectedVideo.description}
                    placeholder="Describe what students will learn..."
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-videoUrl">Video URL *</Label>
                    <Input
                      id="edit-videoUrl"
                      name="videoUrl"
                      defaultValue={selectedVideo.video_url}
                      placeholder="https://youtube.com/watch?v=..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="edit-thumbnailUrl"
                      name="thumbnailUrl"
                      defaultValue={selectedVideo.thumbnail_url}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (seconds) *</Label>
                    <Input
                      id="edit-duration"
                      name="duration"
                      type="number"
                      defaultValue={selectedVideo.duration}
                      placeholder="300"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category *</Label>
                    <Select name="category" defaultValue={selectedVideo.category} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Programming">Programming</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Robotics">Robotics</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-gradeLevel">Grade Level *</Label>
                    <Select name="gradeLevel" defaultValue={selectedVideo.grade_level.toString()} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5th Grade</SelectItem>
                        <SelectItem value="6">6th Grade</SelectItem>
                        <SelectItem value="7">7th Grade</SelectItem>
                        <SelectItem value="8">8th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={selectedVideo.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
