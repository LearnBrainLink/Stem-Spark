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
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, Play, Clock } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  duration: number
  category: string
  grade_level: number
  status: string
  created_at: string
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

    if (data) {
      setVideos(data)
    }
  }

  const handleCreateVideo = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage({ type: "error", text: "You must be logged in" })
      setIsLoading(false)
      return
    }

    const videoData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      video_url: formData.get("videoUrl") as string,
      thumbnail_url: formData.get("thumbnailUrl") as string,
      duration: Number.parseInt(formData.get("duration") as string),
      category: formData.get("category") as string,
      grade_level: Number.parseInt(formData.get("gradeLevel") as string),
      created_by: user.id,
      status: "active",
    }

    const { error } = await supabase.from("videos").insert(videoData)

    if (error) {
      setMessage({ type: "error", text: "Failed to create video" })
    } else {
      setMessage({ type: "success", text: "Video created successfully!" })
      setIsCreateDialogOpen(false)
      fetchVideos()

      // Log activity
      await supabase.from("user_activities").insert({
        user_id: user.id,
        activity_type: "video_created",
        activity_description: `Created video: ${videoData.title}`,
        metadata: { title: videoData.title, category: videoData.category },
      })
    }

    setIsLoading(false)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    const { error } = await supabase.from("videos").delete().eq("id", videoId)

    if (error) {
      setMessage({ type: "error", text: "Failed to delete video" })
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-30 shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo width={48} height={48} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Manage Videos
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline">Admin Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-4 pt-4 shrink-0">
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
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {message && (
          <Alert className={`mb-2 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"} shrink-0`}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Videos Grid - scrollable, compact */}
        <div className="flex-1 min-h-0 overflow-auto px-4 pb-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="border-0 shadow-xl rounded-xl overflow-hidden bg-white">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {video.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Grade {video.grade_level}
                        </Badge>
                        <Badge variant={video.status === "active" ? "default" : "secondary"} className="text-xs">
                          {video.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteVideo(video.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 min-h-[3.5em]">{video.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {videos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base mb-3">No videos uploaded yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md text-sm px-4 py-2">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Video
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
