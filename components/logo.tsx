interface LogoProps {
  width?: number
  height?: number
  className?: string
}

export function Logo({ width = 48, height = 48, className = "" }: LogoProps) {
  return (
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
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>

      {/* Gear/Cog */}
      <g transform="translate(8, 8)">
        <circle cx="16" cy="16" r="6" fill="url(#logoGradient)" />
        <circle cx="16" cy="16" r="3" fill="white" />

        {/* Gear teeth */}
        <rect x="15" y="2" width="2" height="4" fill="url(#logoGradient)" />
        <rect x="15" y="26" width="2" height="4" fill="url(#logoGradient)" />
        <rect x="2" y="15" width="4" height="2" fill="url(#logoGradient)" />
        <rect x="26" y="15" width="4" height="2" fill="url(#logoGradient)" />

        <rect x="21.5" y="5.5" width="2" height="3" fill="url(#logoGradient)" transform="rotate(45 22.5 7)" />
        <rect x="8.5" y="23.5" width="2" height="3" fill="url(#logoGradient)" transform="rotate(45 9.5 25)" />
        <rect x="5.5" y="8.5" width="3" height="2" fill="url(#logoGradient)" transform="rotate(45 7 9.5)" />
        <rect x="23.5" y="21.5" width="3" height="2" fill="url(#logoGradient)" transform="rotate(45 25 22.5)" />
      </g>

      {/* Lightning bolt/Spark */}
      <path
        d="M28 12 L32 8 L30 16 L36 16 L28 28 L30 20 L24 20 Z"
        fill="url(#logoGradient)"
        stroke="white"
        strokeWidth="1"
      />

      {/* Circuit lines */}
      <path
        d="M4 40 L12 40 M20 40 L28 40 M36 40 L44 40"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="40" r="2" fill="url(#logoGradient)" />
      <circle cx="32" cy="40" r="2" fill="url(#logoGradient)" />
    </svg>
  )
}
