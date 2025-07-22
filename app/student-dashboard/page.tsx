'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Calendar, 
  MessageSquare,
  Play,
  ArrowRight,
  LogOut,
  Bell,
  Award,
  Video,
  Home,
  GraduationCap,
  MessageCircle,
  Clock
} from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  duration_hours: number
  instructor_id: string
  instructor_name?: string
  progress?: number
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [tutoringSessions, setTutoringSessions] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)

  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadDashboardData(authUser.id)
    } catch (error) {
      console.error('Error in checkAuth:', error)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setUser(profile)
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadDashboardData = async (userId: string) => {
    try {
      // Load user's course enrollments with course details
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            category,
            difficulty_level,
            duration_hours,
            instructor_id
          )
        `)
        .eq('student_id', userId)

      if (enrollmentError) {
        console.error('Error loading enrollments:', enrollmentError)
      } else {
        setEnrollments(enrollmentData || [])
        // Extract courses from enrollments
        const courseData = enrollmentData?.map(enrollment => ({
          ...enrollment.courses,
          progress: enrollment.progress || 0
        })) || []
        setCourses(courseData)
      }

      // Load tutoring sessions
      const { data: tutoringData, error: tutoringError } = await supabase
        .from('tutoring_sessions')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (tutoringError) {
        console.error('Error loading tutoring sessions:', tutoringError)
      } else {
        setTutoringSessions(tutoringData || [])
      }

      // Load recent videos
      const { data: videoData, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (videoError) {
        console.error('Error loading videos:', videoError)
      } else {
        setVideos(videoData || [])
      }

      // Load unread message count
      await loadUnreadMessageCount(userId)

    } catch (error) {
      console.error('Error in loadDashboardData:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadMessageCount = async (userId: string) => {
    try {
      const { data: messageData, error } = await supabase
        .from('message_reads')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Error loading unread messages:', error)
      } else {
        setUnreadMessageCount(messageData?.length || 0)
      }
    } catch (error) {
      console.error('Error in loadUnreadMessageCount:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/novakinetix-logo.png"
                alt="NovaKinetix Academy"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.full_name || 'Student'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/communication-hub">
                <Button variant="outline" size="sm" className="relative">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                  {unreadMessageCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {unreadMessageCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Tutoring Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{tutoringSessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Video className="w-8 h-8 text-purple-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Videos</p>
                  <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-yellow-600 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Courses</h2>
            <Link href="/learning-path">
              <Button variant="outline" size="sm">
                View All Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <Badge variant="secondary">{course.difficulty_level}</Badge>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{course.duration_hours}h</span>
                      <span>{course.category}</span>
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Continue Learning
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses enrolled yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by exploring our available courses.</p>
                <Link href="/learning-path">
                  <Button>
                    Browse Courses
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/tutoring">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Book Tutoring</h3>
                <p className="text-sm text-gray-600">Schedule a session with our expert tutors</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/videos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Video className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Watch Videos</h3>
                <p className="text-sm text-gray-600">Access our library of educational content</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/communication-hub">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Messages</h3>
                <p className="text-sm text-gray-600">Connect with teachers and peers</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/competitions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Competitions</h3>
                <p className="text-sm text-gray-600">Participate in STEM challenges</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Tutoring Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Tutoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tutoringSessions.length > 0 ? (
                <div className="space-y-4">
                  {tutoringSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{session.subject}</p>
                        <p className="text-sm text-gray-600">{new Date(session.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No recent tutoring sessions</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Videos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Recent Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {videos.length > 0 ? (
                <div className="space-y-4">
                  {videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{video.title}</p>
                        <p className="text-sm text-gray-600">{video.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No recent videos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 