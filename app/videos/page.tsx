import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
}

export default async function VideosPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get user profile to check grade level
  const { data: profile } = await supabase.from("profiles").select("grade, role").eq("id", user.id).single()

  // Get videos (filter by grade level for students)
  let videosQuery = supabase.from("videos").select("*").eq("status", "active").order("created_at", { ascending: false })

  if (profile?.role === "student" && profile?.grade) {
    videosQuery = videosQuery.eq("grade_level", profile.grade)
  }

  const { data: videos } = await videosQuery

  const categories = [...new Set(videos?.map((v) => v.category) || [])]

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Learning Videos
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/internships">
              <Button variant="outline">Internships</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            STEM Learning Videos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of educational videos designed to make STEM concepts engaging and accessible
          </p>
          {profile?.grade && (
            <Badge className="mt-4" variant="secondary">
              Grade {profile.grade} Content
            </Badge>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="text-sm py-1 px-3">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.map((video: Video) => (
            <Card key={video.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {video.thumbnail_url ? (
                    <Image
                      src={video.thumbnail_url || "/placeholder.svg"}
                      alt={video.title}
                      width={400}
                      height={225}
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {video.category}
                      </Badge>
                      {video.grade_level && (
                        <Badge variant="outline" className="text-xs">
                          Grade {video.grade_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>
                <Button className="w-full" asChild>
                  <Link href={`/videos/${video.id}`}>
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!videos || videos.length === 0) && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Videos Available</h3>
            <p className="text-gray-500">
              {profile?.role === "student"
                ? "No videos are currently available for your grade level. Check back soon!"
                : "No videos are currently available. Check back soon for new content!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
