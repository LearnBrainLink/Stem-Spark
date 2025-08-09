'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  className?: string
  autoPlay?: boolean
  controls?: boolean
}

// Function to extract YouTube video ID from various YouTube URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

// Function to check if URL is a YouTube video
function isYouTubeUrl(url: string): boolean {
  return getYouTubeVideoId(url) !== null
}

export function VideoPlayer({ 
  videoUrl, 
  title, 
  className, 
  autoPlay = false,
  controls = true 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Auto-hide controls in fullscreen
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isFullscreen) {
      const resetTimeout = () => {
        clearTimeout(timeout)
        setShowControls(true)
        timeout = setTimeout(() => setShowControls(false), 3000)
      }

      const handleMouseMove = () => resetTimeout()
      document.addEventListener('mousemove', handleMouseMove)
      resetTimeout()

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        clearTimeout(timeout)
      }
    } else {
      setShowControls(true)
    }
  }, [isFullscreen])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (isFullscreen) {
        await document.exitFullscreen()
      } else {
        await containerRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds
    }
  }

  // YouTube embed handling
  if (isYouTubeUrl(videoUrl)) {
    const videoId = getYouTubeVideoId(videoUrl)
    if (!videoId) return <div>Invalid YouTube URL</div>

    const embedUrl = `https://www.youtube.com/embed/${videoId}?${new URLSearchParams({
      autoplay: autoPlay ? '1' : '0',
      controls: controls ? '1' : '0',
      modestbranding: '1',
      rel: '0',
      fs: '1' // Enable fullscreen
    }).toString()}`

    return (
      <div 
        ref={containerRef}
        className={cn(
          'relative w-full bg-black rounded-lg overflow-hidden group',
          isFullscreen && 'fixed inset-0 z-50 rounded-none',
          className
        )}
      >
        <div className={cn(
          'relative w-full',
          isFullscreen ? 'h-screen' : 'aspect-video'
        )}>
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
          
          {/* Custom fullscreen button overlay for YouTube */}
          <div className={cn(
            'absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity',
            showControls ? 'opacity-100' : 'opacity-0',
            isFullscreen && !showControls && 'opacity-0'
          )}>
            <Button
              size="sm"
              variant="secondary"
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white border-none"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Direct video file handling
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full bg-black rounded-lg overflow-hidden group',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => !isFullscreen && setShowControls(true)}
    >
      <div className={cn(
        'relative w-full',
        isFullscreen ? 'h-screen' : 'aspect-video'
      )}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          autoPlay={autoPlay}
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setIsMuted(videoRef.current.muted)
            }
          }}
        />

        {/* Video Controls */}
        {controls && (
          <div className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex-1" />

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
