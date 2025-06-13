"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface RedirectHandlerProps {
  redirectUrl?: string
  delay?: number
}

export function RedirectHandler({ redirectUrl, delay = 1000 }: RedirectHandlerProps) {
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
