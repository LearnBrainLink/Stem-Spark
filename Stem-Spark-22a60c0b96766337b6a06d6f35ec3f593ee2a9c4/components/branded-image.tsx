"use client"

import { useState } from "react"
import Image from "next/image"
import { Logo } from "@/components/logo"

interface BrandedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  showBranding?: boolean
  brandingPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
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
  showAcademyText = false,
}: BrandedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const getPositionClasses = () => {
    switch (brandingPosition) {
      case "top-left":
        return "top-4 left-4"
      case "top-right":
        return "top-4 right-4"
      case "bottom-left":
        return "bottom-4 left-4"
      case "bottom-right":
      default:
        return "bottom-4 right-4"
    }
  }

  if (imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-brand-accent to-brand-surface flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <Logo variant="large" className="mx-auto mb-4 opacity-50" />
          <p className="text-brand-secondary">Image not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-accent/20">
          <div className="loading-spinner"></div>
        </div>
      )}

      <Image
        src={src && src !== "/images/logo.png" ? src : "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover w-full h-full transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority={priority}
      />

      {showBranding && (
        <div className={`absolute ${getPositionClasses()} z-10`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-brand">
            <Logo variant="icon" width={40} height={40} />
            {showAcademyText && (
              <div className="text-xs font-bold text-brand-primary mt-1 text-center">NOVAKINETIX</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
