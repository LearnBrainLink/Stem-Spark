interface LogoProps {
  width?: number
  height?: number
  className?: string
  variant?: "full" | "icon"
}

export function Logo({ width = 48, height = 48, className = "", variant = "full" }: LogoProps) {
  const imageUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-SAjaLQIYaIsYn37AAJyFcv7POJ9KTg.png"
  const aspectRatio = variant === "full" ? 2.5 : 1
  const calculatedWidth = variant === "full" ? width * aspectRatio : width

  return (
    <img
      src={imageUrl || "/placeholder.svg"}
      alt="STEM Spark Academy"
      width={calculatedWidth}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
    />
  )
}
