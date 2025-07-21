import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <Image
          src="/images/novakinetix-logo.png"
          alt="NOVAKINETIX ACADEMY Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-blue-600 ${textSizes[size]}`}>
            NOVAKINETIX
          </span>
          <span className={`font-semibold text-blue-500 ${textSizes[size]}`}>
            ACADEMY
          </span>
        </div>
      )}
    </Link>
  )
}

// Fallback SVG logo component for when image fails to load
export function LogoSVG({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Person with graduation cap */}
          <circle cx="50" cy="25" r="8" fill="#2563EB" />
          <rect x="42" y="33" width="16" height="20" fill="#2563EB" />
          <rect x="35" y="33" width="30" height="4" fill="#2563EB" />
          <rect x="40" y="25" width="20" height="2" fill="#2563EB" />
          <rect x="42" y="23" width="16" height="2" fill="#2563EB" />
          
          {/* Raised arms */}
          <path d="M 35 35 L 25 20 L 30 15 L 40 30 Z" fill="#3B82F6" />
          <path d="M 65 35 L 75 20 L 70 15 L 60 30 Z" fill="#3B82F6" />
          
          {/* Wings/leaves */}
          <path d="M 30 50 Q 20 60 25 70 Q 35 65 40 55 Z" fill="#60A5FA" />
          <path d="M 70 50 Q 80 60 75 70 Q 65 65 60 55 Z" fill="#60A5FA" />
          
          {/* Stars */}
          <path d="M 25 15 L 27 20 L 32 20 L 28 24 L 30 29 L 25 26 L 20 29 L 22 24 L 18 20 L 23 20 Z" fill="#FBBF24" />
          <path d="M 75 15 L 77 20 L 82 20 L 78 24 L 80 29 L 75 26 L 70 29 L 72 24 L 68 20 L 73 20 Z" fill="#FBBF24" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-blue-600 ${textSizes[size]}`}>
            NOVAKINETIX
          </span>
          <span className={`font-semibold text-blue-500 ${textSizes[size]}`}>
            ACADEMY
          </span>
        </div>
      )}
    </Link>
  )
} 