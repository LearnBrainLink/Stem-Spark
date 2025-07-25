'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Dashboard: Auth state change:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session?.user) {
        checkUserAndRedirect()
      } else if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    // Initial check
    checkUserAndRedirect()

    return () => subscription.unsubscribe()
  }, [])

  const checkUserAndRedirect = async () => {
    try {
      console.log('Dashboard: Checking authentication...')
      
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      console.log('Dashboard: Auth result:', { user: !!user, error: authError })
      
      if (authError) {
        console.error('Dashboard: Auth error:', authError)
      }
      
      if (!user) {
        console.log('Dashboard: No authenticated user, redirecting to login')
        router.push('/login')
        return
      }

      console.log('Dashboard: User found:', user.email)

      // Get user profile to determine role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      console.log('Dashboard: Profile result:', { profile: !!profile, error: profileError })

      if (profileError) {
        console.error('Dashboard: Error fetching profile:', profileError)
        // Default to student dashboard if profile not found
        router.push('/student-dashboard')
        return
      }

      const userRole = profile?.role || 'student'
      console.log('Dashboard: User role:', userRole)

      // Redirect based on role
      switch (userRole) {
        case 'admin':
          console.log('Dashboard: Redirecting to admin')
          router.push('/admin')
          break
        case 'parent':
          console.log('Dashboard: Redirecting to parent dashboard')
          router.push('/parent-dashboard')
          break
        case 'intern':
          console.log('Dashboard: Redirecting to intern dashboard')
          router.push('/intern-dashboard')
          break
        case 'student':
        default:
          console.log('Dashboard: Redirecting to student dashboard')
          router.push('/student-dashboard')
          break
      }
    } catch (error) {
      console.error('Dashboard: Error in dashboard redirect:', error)
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
