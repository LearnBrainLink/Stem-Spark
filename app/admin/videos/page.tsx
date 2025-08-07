'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Video,
  AlertCircle,
} from 'lucide-react'

// Video Management Page Component
export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<any | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    fetchVideos()
  }, [])

  const getSupabaseClient = async () => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey)
  }

  const fetchVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = await getSupabaseClient()
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setVideos(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch videos.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpsertVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentVideo) return

    try {
      const supabase = await getSupabaseClient()
      const { id, ...upsertData } = currentVideo

      if (id) {
        // Update
        const { error } = await supabase.from('videos').update(upsertData).eq('id', id)
        if (error) throw error
      } else {
        // Create
        const { error } = await supabase.from('videos').insert(upsertData)
        if (error) throw error
      }
      
      await fetchVideos()
      setIsModalOpen(false)
      setCurrentVideo(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save video.')
    }
  }
  
  const handleDeleteVideo = async () => {
    if (!currentVideo?.id) return

    try {
      const supabase = await getSupabaseClient()
      const { error } = await supabase.from('videos').delete().eq('id', currentVideo.id)
      if (error) throw error
      
      await fetchVideos()
      setIsDeleteConfirmOpen(false)
      setCurrentVideo(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete video.')
    }
  }

  const openModal = (video: any | null = null) => {
    setCurrentVideo(video || { title: '', description: '', video_url: '' })
    setIsModalOpen(true)
  }

  const openDeleteConfirm = (video: any) => {
    setCurrentVideo(video)
    setIsDeleteConfirmOpen(true)
  }

  if (loading) return <div>Loading videos...</div>
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Video Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Videos</CardTitle>
          <CardDescription>A list of all videos in the library.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>{video.description}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openModal(video)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteConfirm(video)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Video Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentVideo?.id ? 'Edit Video' : 'Add New Video'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpsertVideo}>
            <div className="py-4 grid gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={currentVideo?.title || ''}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={currentVideo?.description || ''}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input
                  id="video_url"
                  value={currentVideo?.video_url || ''}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, video_url: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <AlertDescription>
              This action cannot be undone. This will permanently delete the video "{currentVideo?.title}".
            </AlertDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

