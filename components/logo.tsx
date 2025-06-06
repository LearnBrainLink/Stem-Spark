"use client"

import { useState } from "react"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  variant?: "full" | "icon" | "with-text"
  showText?: boolean
}

export function Logo({ width = 48, height = 48, className = "", variant = "full", showText = false }: LogoProps) {
  const [imageError, setImageError] = useState(false)
  const imageUrl =
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Adobe%20Express%20-%20file-YjeaBm51JXPy1MlJEvsrGjiJ7g9Ci4.png"

  // Fallback SVG logo if image fails to load
  const FallbackLogo = () => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A2559" />
          <stop offset="100%" stopColor="#FF5722" />
        </linearGradient>
      </defs>

      {/* Shield shape */}
      <path d="M24 4L8 12V24C8 32 16 40 24 44C32 40 40 32 40 24V12L24 4Z" fill="url(#logoGradient)" />

      {/* SS text */}
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        SS
      </text>
    </svg>
  )

  if (variant === "with-text") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {imageError ? (
          <FallbackLogo />
        ) : (
          <img
            src={imageUrl || "/placeholder.svg"}
            alt="STEM Spark Academy Logo"
            width={width}
            height={height}
            className="object-contain"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        )}
        {showText && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-brand-navy leading-tight">STEM SPARK</span>
            <span className="text-lg font-semibold text-brand-orange leading-tight">ACADEMY</span>
          </div>
        )}
      </div>
    )
  }

  return imageError ? (
    <FallbackLogo />
  ) : (
    <img
      src={imageUrl || "/placeholder.svg"}
      alt="STEM Spark Academy Logo"
      width={width}
      height={height}
      className={`object-contain ${className}`}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  )
}
