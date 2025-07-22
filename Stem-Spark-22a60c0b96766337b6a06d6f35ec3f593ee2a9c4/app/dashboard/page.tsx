'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUserAndRedirect()
  }, [])

  const checkUserAndRedirect = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.log('No authenticated user, redirecting to login')
        router.push('/login')
        return
      }

      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        // Default to student dashboard if profile not found
        router.push('/student-dashboard')
        return
      }

      const userRole = profile?.role || 'student'
      console.log('User role:', userRole)

      // Redirect based on role
      switch (userRole) {
        case 'admin':
          router.push('/admin')
          break
        case 'parent':
          router.push('/parent-dashboard')
          break
        case 'intern':
          router.push('/intern-dashboard')
          break
        case 'student':
        default:
          router.push('/student-dashboard')
          break
      }
    } catch (error) {
      console.error('Error in dashboard redirect:', error)
      // Fallback to student dashboard
      router.push('/student-dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-xl text-gray-600">Loading your dashboard...</div>
      </div>
    </div>
  )
}
