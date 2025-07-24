'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Play, Plus, Search, Filter, Clock, Eye, ThumbsUp, MessageCircle, Share, Edit, Trash2, Upload, Video, FileText, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface VideoItem {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url?: string
  duration: number
  category: string
  created_at: string
  created_by: string
  status: string
}

export default function VideosPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadVideos()
    } catch (error) {
      console.error('Error in checkAuth:', error)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setUser(profile)
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadVideos = async () => {
    try {
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!videoError && videoData) {
        setVideos(videoData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error in loadVideos:', error)
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(videos.map(v => v.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading videos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/novakinetix-logo.png"
                  alt="NovaKinetix Academy"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/student-dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {video.thumbnail_url ? (
                  <Image
                    src={video.thumbnail_url}
                    alt={video.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="opacity-0 hover:opacity-100 transition-opacity duration-200"
                    onClick={() => window.open(video.video_url, '_blank')}
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2">{video.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{video.category}</Badge>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(video.video_url, '_blank')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Watch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No videos match your search criteria</p>
            <Button className="mt-4" onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
