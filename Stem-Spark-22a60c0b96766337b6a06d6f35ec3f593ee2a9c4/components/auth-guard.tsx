"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { Lock, User, GraduationCap, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: ('intern' | 'student')[]
  fallback?: React.ReactNode
}

export default function AuthGuard({ 
  children, 
  requiredRoles = ['intern', 'student'],
  fallback 
}: AuthGuardProps) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          setError('Authentication error')
          setLoading(false)
          return
        }

        if (!user) {
          setLoading(false)
          return
        }

        setUser(user)

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          setError('Profile not found')
          setLoading(false)
          return
        }

        setUserProfile(profile)
        setLoading(false)
      } catch (err) {
        setError('An error occurred')
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Lock className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Required
            </CardTitle>
            <p className="text-gray-600 mt-2">
              This feature requires a full account. Please sign in or create an account to continue.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Student</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4" />
                <span>Intern</span>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/login" className="block">
                <Button className="w-full" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign up" className="block">
                <Button className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Profile Setup Required
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Please complete your profile setup to access this feature.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/profile" className="block">
              <Button className="w-full">
                Complete Profile
              </Button>
            </Link>
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!requiredRoles.includes(userProfile.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Lock className="w-12 h-12 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Access Denied
            </CardTitle>
            <p className="text-gray-600 mt-2">
              This feature is only available for {requiredRoles.join(' and ')} accounts.
              Your current role: <span className="font-semibold capitalize">{userProfile.role}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm">
                Go to Dashboard
              </Link>
            </div>
            <div className="text-center">
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
} 