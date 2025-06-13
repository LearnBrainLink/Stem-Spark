"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthRedirectHandlerProps {
  redirectUrl?: string
  delay?: number
}

export function AuthRedirectHandler({ redirectUrl, delay = 1500 }: AuthRedirectHandlerProps) {
  const router = useRouter()

  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        router.push(redirectUrl)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [redirectUrl, delay, router])

  return null
}
