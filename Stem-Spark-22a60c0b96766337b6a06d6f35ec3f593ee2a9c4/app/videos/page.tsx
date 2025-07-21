import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { BrandedImage } from "@/components/branded-image"

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

  // Curated educational images for video thumbnails
  const getVideoThumbnail = (category: string, index: number) => {
    const thumbnails = {
      Engineering: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581092335397-9fa341108e1e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=800&auto=format&fit=crop",
      ],
      Programming: [
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=800&auto=format&fit=crop",
      ],
      Mathematics: [
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop",
      ],
      Science: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1628595351029-c2bf17511435?q=80&w=800&auto=format&fit=crop",
      ],
      Robotics: [
        "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1561557944-6e7860d1a7eb?q=80&w=800&auto=format&fit=crop",
      ],
      Design: [
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1572177812156-58036aae439c?q=80&w=800&auto=format&fit=crop",
      ],
    }

    const categoryImages = thumbnails[category as keyof typeof thumbnails] || thumbnails.Engineering
    return categoryImages[index % categoryImages.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo width={40} height={40} variant="with-text" showText />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="text-brand-navy border-brand-navy">
                Dashboard
              </Button>
            </Link>
            <Link href="/internships">
              <Button variant="outline" className="text-brand-navy border-brand-navy">
                Internships
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="text-brand-navy border-brand-navy">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 brand-text-gradient">STEM Learning Videos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our collection of educational videos designed to make STEM concepts engaging and accessible at STEM
            Spark Academy
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
            <h2 className="text-2xl font-bold mb-4 text-brand-navy">Categories</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge key={category} variant="outline" className="text-sm py-1 px-3 border-brand-navy text-brand-navy">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos?.map((video: Video, index: number) => (
            <Card key={video.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative">
                <div className="aspect-video">
                  <BrandedImage
                    src={video.thumbnail_url || getVideoThumbnail(video.category, index)}
                    alt={`${video.title} - STEM Spark Academy`}
                    width={400}
                    height={225}
                    className="w-full h-full"
                    showBranding={true}
                    brandingPosition="bottom-right"
                  />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(video.duration)}
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-16 bg-brand-navy/80 rounded-full flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2 text-brand-navy">{video.title}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {video.category}
                      </Badge>
                      {video.grade_level && (
                        <Badge variant="outline" className="text-xs border-brand-navy text-brand-navy">
                          Grade {video.grade_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{video.description}</p>
                <Button className="w-full bg-brand-navy text-white hover:bg-brand-dark" asChild>
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
            <div className="mt-4">
              <Logo width={60} height={60} className="mx-auto opacity-50" />
              <p className="text-sm text-gray-400 mt-2">STEM Spark Academy</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
