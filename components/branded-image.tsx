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
}: BrandedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fallback image URL
  const fallbackSrc = "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop"

  // Position classes for branding
  const positionClasses = {
    "top-left": "top-2 left-2",
    "top-right": "top-2 right-2",
    "bottom-left": "bottom-2 left-2",
    "bottom-right": "bottom-2 right-2",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading indicator */}
      {!isLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-brand-navy border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Image */}
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        onError={() => setImageError(true)}
        onLoad={() => setIsLoaded(true)}
        priority={priority}
      />

      {/* Branding overlay */}
      {showBranding && isLoaded && (
        <div className={`absolute ${positionClasses[brandingPosition]} z-10`}>
          <div className="bg-white/80 backdrop-blur-sm rounded-md px-2 py-1 shadow-sm flex items-center gap-2">
            <Logo width={16} height={16} />
            <span className="text-xs font-medium text-brand-navy">STEM Spark Academy</span>
          </div>
        </div>
      )}
    </div>
  )
}
