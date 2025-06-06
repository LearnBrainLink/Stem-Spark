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

  const getBrandingClasses = () => {
    const baseClasses = "absolute z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg"

    switch (brandingPosition) {
      case "top-left":
        return `${baseClasses} top-4 left-4`
      case "top-right":
        return `${baseClasses} top-4 right-4`
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`
      case "center":
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
      default:
        return `${baseClasses} bottom-4 right-4`
    }
  }

  if (imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-brand-navy to-brand-dark rounded-lg flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-white p-4">
          <Logo width={60} height={60} className="mx-auto mb-2" />
          <p className="text-sm font-medium">STEM Spark Academy</p>
          <p className="text-xs opacity-75">Image not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={width}
        height={height}
        className="rounded-lg object-cover w-full h-full"
        onError={() => setImageError(true)}
        priority={priority}
      />

      {showBranding && (
        <div className={getBrandingClasses()}>
          <div className="flex items-center gap-2">
            <Logo width={24} height={24} />
            <span className="text-xs font-semibold text-brand-navy">STEM Spark Academy</span>
          </div>
        </div>
      )}
    </div>
  )
}
