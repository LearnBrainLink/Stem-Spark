'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VideoPlayer } from './video-player'
import { Badge } from './badge'
import { Clock, Calendar, User } from 'lucide-react'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  video: {
    id: string
    title: string
    description: string
    video_url: string
    thumbnail_url: string | null
    duration: number
    category: string
    status: string
    created_at: string
    created_by: string | null
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Video Player */}
          <div className="flex-shrink-0">
            <VideoPlayer
              videoUrl={video.video_url}
              title={video.title}
              autoPlay={true}
              controls={true}
              className="rounded-t-lg"
            />
          </div>
          
          {/* Video Info */}
          <div className="p-6 flex-1 overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-left">
                {video.title}
              </DialogTitle>
            </DialogHeader>
            
            {/* Video Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(video.duration)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(video.created_at)}</span>
              </div>
              
              {video.created_by && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{video.created_by}</span>
                </div>
              )}
              
              <Badge variant="secondary" className="ml-auto">
                {video.category}
              </Badge>
            </div>
            
            {/* Video Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
