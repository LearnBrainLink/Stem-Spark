"use client"

import { useState } from "react"
import Image from "next/image"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  variant?: "full" | "icon" | "with-text"
  showText?: boolean
}

export function Logo({ width = 48, height = 48, className = "", variant = "full", showText = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Use the correct blob URL for the logo
  const imageUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-Es1GtGpls4shSscGjp8jpeTXPdDeC6.png"

  // Fallback SVG logo that matches the actual design
  const FallbackLogo = () => (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shield background */}
        <path
          d="M100 20L40 50V120C40 160 70 190 100 200C130 190 160 160 160 120V50L100 20Z"
          fill="#0A2559"
          stroke="#0A2559"
          strokeWidth="2"
        />

        {/* Orange stripes on left */}
        <rect x="45" y="60" width="20" height="8" fill="#FF5722" />
        <rect x="45" y="75" width="20" height="8" fill="#FF5722" />
        <rect x="45" y="90" width="20" height="8" fill="#FF5722" />

        {/* Orange stripes on right */}
        <rect x="135" y="60" width="20" height="8" fill="#FF5722" />
        <rect x="135" y="75" width="20" height="8" fill="#FF5722" />
        <rect x="135" y="90" width="20" height="8" fill="#FF5722" />

        {/* White center area */}
        <rect x="75" y="55" width="50" height="70" fill="white" rx="5" />

        {/* SS text */}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          fill="#0A2559"
          fontSize="28"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          SS
        </text>
      </svg>

      {/* STEM Spark Academy text overlay for branding */}
      {showText && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-semibold text-[#0A2559] whitespace-nowrap">STEM Spark Academy</div>
        </div>
      )}
    </div>
  )

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  if (variant === "with-text") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative" style={{ width, height }}>
          {!imageError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                  <div className="w-4 h-4 border-2 border-[#0A2559] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="STEM Spark Academy Logo"
                width={width}
                height={height}
                className={`object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                priority
              />
            </>
          ) : (
            <FallbackLogo />
          )}
        </div>

        {showText && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-[#0A2559] leading-tight">STEM SPARK</span>
            <span className="text-lg font-semibold text-[#FF5722] leading-tight">ACADEMY</span>
          </div>
        )}
      </div>
    )
  }

  if (imageError) {
    return <FallbackLogo />
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="w-4 h-4 border-2 border-[#0A2559] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imageUrl || "/placeholder.svg"}
        alt="STEM Spark Academy Logo"
        width={width}
        height={height}
        className={`object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority
      />

      {/* Add STEM Spark Academy text for branding when appropriate */}
      {showText && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs font-semibold text-[#0A2559] whitespace-nowrap">STEM Spark Academy</div>
        </div>
      )}
    </div>
  )
}
