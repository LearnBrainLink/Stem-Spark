'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  grade?: number
  school?: string
  subject?: string
  children?: string
}

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Profile not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.full_name}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 capitalize">{profile.role}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {profile.full_name}</p>
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <p><span className="font-medium">Role:</span> <span className="capitalize">{profile.role}</span></p>
              {profile.grade && <p><span className="font-medium">Grade:</span> {profile.grade}</p>}
              {profile.school && <p><span className="font-medium">School:</span> {profile.school}</p>}
              {profile.subject && <p><span className="font-medium">Subject:</span> {profile.subject}</p>}
              {profile.children && <p><span className="font-medium">Children:</span> {profile.children}</p>}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/communication-hub"
                className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Communication Hub
              </Link>
              
              {profile.role === 'student' && (
                <Link
                  href="/intern-application"
                  className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Apply as Intern
                </Link>
              )}
              
              <Link
                href="/help"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Help & Support
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Account created successfully
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Welcome to NovaKinetix Academy
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {profile.role === 'student' && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">STEM Programs</h4>
                <p className="text-sm text-gray-600 mt-1">Access to cutting-edge STEM education programs</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Internship Opportunities</h4>
                <p className="text-sm text-gray-600 mt-1">Apply for internship positions and gain experience</p>
              </div>
            </div>
          </div>
        )}

        {profile.role === 'parent' && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Communication Hub</h4>
                <p className="text-sm text-gray-600 mt-1">Connect with teachers and stay updated on your child's progress</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Parent Portal</h4>
                <p className="text-sm text-gray-600 mt-1">Monitor your child's activities and achievements</p>
              </div>
            </div>
          </div>
        )}

        {profile.role === 'teacher' && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Resources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Teaching Tools</h4>
                <p className="text-sm text-gray-600 mt-1">Access educational resources and teaching materials</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900">Student Communication</h4>
                <p className="text-sm text-gray-600 mt-1">Connect with students and parents through the messaging system</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 