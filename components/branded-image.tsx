"use client"

import { useState } from "react"
import Image from "next/image"
import { Logo } from "./logo"

interface BrandedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  showBranding?: boolean
  brandingPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  priority?: boolean
  showAcademyText?: boolean
}

export function BrandedImage({
  src,
  alt,
  width,
  height,
  className = "",
  showBranding = false,
  brandingPosition = "bottom-right",
  priority = false,
  showAcademyText = true,
}: BrandedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Curated fallback images for different contexts
  const fallbackImages = {
    engineering: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
    programming: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
    mathematics: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    science: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
    students: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop",
    default: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
  }

  // Determine fallback based on alt text
  const getFallbackImage = () => {
    const altLower = alt.toLowerCase()
    if (altLower.includes("engineering")) return fallbackImages.engineering
    if (altLower.includes("programming") || altLower.includes("coding")) return fallbackImages.programming
    if (altLower.includes("math")) return fallbackImages.mathematics
    if (altLower.includes("science")) return fallbackImages.science
    if (altLower.includes("student")) return fallbackImages.students
    return fallbackImages.default
  }

  // Position classes for branding
  const positionClasses = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  }

  const handleImageLoad = () => {
    setIsLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setIsLoaded(true)
  }

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* Loading indicator */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0A2559] to-[#1a365d]"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
          <Logo width={40} height={40} className="opacity-80 mb-2" />
          <div className="text-white text-sm font-medium">STEM Spark Academy</div>
          <div className="text-white/70 text-xs">Loading...</div>
        </div>
      )}

      {/* Main Image */}
      <Image
        src={imageError ? getFallbackImage() : src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority={priority}
      />

      {/* Error state with STEM Spark Academy branding */}
      {imageError && isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0A2559] to-[#1a365d] text-white">
          <Logo width={60} height={60} className="mb-4 opacity-90" />
          <div className="text-center px-4">
            <h3 className="text-lg font-bold mb-2">STEM Spark Academy</h3>
            <p className="text-sm opacity-80">Empowering Young Engineers</p>
            <p className="text-xs opacity-60 mt-2">Image temporarily unavailable</p>
          </div>
        </div>
      )}

      {/* Branding overlay */}
      {showBranding && isLoaded && !imageError && (
        <div className={`absolute ${positionClasses[brandingPosition]} z-10`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20">
            <div className="flex items-center gap-2">
              <Logo width={20} height={20} />
              {showAcademyText && (
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#0A2559] leading-tight">STEM Spark</span>
                  <span className="text-xs font-semibold text-[#FF5722] leading-tight">Academy</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom text overlay for aesthetic branding */}
      {showAcademyText && isLoaded && !showBranding && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center gap-2 text-white">
            <Logo width={24} height={24} />
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-tight">STEM Spark Academy</span>
              <span className="text-xs opacity-80 leading-tight">Empowering Young Engineers</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
