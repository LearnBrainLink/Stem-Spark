'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
  Clock,
  Bot
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
          course:courses(
            *,
            instructor:profiles!courses_instructor_id_fkey(full_name)
          )
        `)
        .eq('student_id', userId)
        .eq('status', 'active')

      if (!enrollmentError && enrollmentData) {
        setEnrollments(enrollmentData)
        
        // Transform enrollments to courses with progress
        const coursesWithProgress = enrollmentData.map((enrollment: any) => ({
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          category: enrollment.course.category,
          difficulty_level: enrollment.course.difficulty_level,
          duration_hours: enrollment.course.duration_hours,
          instructor_id: enrollment.course.instructor_id,
          instructor_name: enrollment.course.instructor?.full_name || 'Unknown Instructor',
          progress: enrollment.progress_percentage || 0
        }))
        setCourses(coursesWithProgress)
      }

      // Load tutoring sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('tutoring_sessions')
        .select(`
          *,
          intern:profiles!tutoring_sessions_intern_id_fkey(full_name)
        `)
        .eq('student_id', userId)
        .order('scheduled_time', { ascending: true })

      if (!sessionsError && sessions) {
        setTutoringSessions(sessions)
      }

      // Load chat messages
      const { data: chatMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!messagesError && chatMessages) {
        // Get sender profiles separately
        const senderIds = [...new Set(chatMessages.map(msg => msg.sender_id).filter(Boolean))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', senderIds)

        const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])
        
        const messagesWithSenders = chatMessages.map(msg => ({
          ...msg,
          sender: {
            full_name: profilesMap.get(msg.sender_id)?.full_name || 'Unknown User'
          }
        }))
        
        setMessages(messagesWithSenders)
      }

      // Load videos
      const { data: videoData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)

      if (!videosError && videoData) {
        setVideos(videoData)
      }

      // Load unread message count
      await loadUnreadMessageCount(userId)

      setLoading(false)
    } catch (error) {
      console.error('Error in loadDashboardData:', error)
      setLoading(false)
    }
  }

  const loadUnreadMessageCount = async (userId: string) => {
    try {
      // Get all messages not sent by current user
      const { data: allMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id')
        .neq('sender_id', userId)

      if (!messagesError && allMessages) {
        // Get messages that user has read
        const { data: readMessages, error: readError } = await supabase
          .from('message_reads')
          .select('message_id')
          .eq('user_id', userId)
          .in('message_id', allMessages.map(m => m.id))

        if (!readError) {
          const readMessageIds = readMessages?.map(m => m.message_id) || []
          const unreadCount = allMessages.length - readMessageIds.length
          setUnreadMessageCount(Math.max(0, unreadCount))
        }
      }
    } catch (error) {
      console.error('Error loading unread message count:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading your dashboard...</div>
        </div>
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
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/novakinetix-logo.png"
                  alt="NovaKinetix Academy"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              </div>
              {user && (
                <div className="text-sm text-gray-600">
                  Welcome back, {user.full_name}!
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/ai-tutor">
                  <Bot className="h-4 w-4 mr-2" />
                  AI Tutor
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/communication-hub">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Messages
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/tutoring">
                  <Users className="h-4 w-4 mr-2" />
                  Tutoring
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses in Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.filter(c => c.progress && c.progress > 0 && c.progress < 100).length}</div>
              <p className="text-xs text-muted-foreground">
                {courses.filter(c => c.progress === 100).length} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutoringSessions.filter(s => s.status === 'scheduled').length}</div>
              <p className="text-xs text-muted-foreground">
                Next session in 2 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.total_volunteer_hours || 0}</div>
              <p className="text-xs text-muted-foreground">
                Volunteer hours logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadMessageCount}</div>
              <p className="text-xs text-muted-foreground">
                New messages waiting
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    My Courses
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/learning-path">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      View All
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.description}</p>
                          <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                            <span>{course.instructor_name}</span>
                            <span>{course.duration_hours} hours</span>
                            <Badge variant="outline">{course.difficulty_level}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{course.progress}%</div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/learning-path?course=${course.id}`}>
                              <Play className="h-4 w-4 mr-1" />
                              Continue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No courses enrolled yet</p>
                      <Button className="mt-2" asChild>
                        <Link href="/learning-path">
                          Browse Courses
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Recent Videos
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/videos">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      View All
                    </Link>
                  </Button>
                </CardTitle>
                <CardDescription>
                  Continue watching where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div key={video.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Play className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{video.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{video.description}</p>
                          <div className="flex items-center mt-2 space-x-2 text-xs text-gray-500">
                            <span>{video.duration} min</span>
                            <span>•</span>
                            <span>{video.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Access your most used features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/tutoring">
                      <Users className="h-4 w-4 mr-2" />
                      Book Tutoring Session
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/ai-tutor">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Tutor
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/communication-hub">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/learning-path">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/videos">
                      <Video className="h-4 w-4 mr-2" />
                      Watch Videos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Tutoring Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Upcoming Sessions
                </CardTitle>
                <CardDescription>
                  Your scheduled tutoring sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tutoringSessions.length > 0 ? (
                    tutoringSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{session.subject}</p>
                          <p className="text-xs text-gray-600">with {session.intern?.full_name || 'Unknown Tutor'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(session.scheduled_time).toLocaleDateString()} at{' '}
                            {new Date(session.scheduled_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                          {session.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No upcoming sessions</p>
                      <Button size="sm" className="mt-2" asChild>
                        <Link href="/tutoring">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Book Session
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Messages
                </CardTitle>
                <CardDescription>
                  Latest conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {messages.length > 0 ? (
                    messages.slice(0, 3).map((message) => (
                      <div key={message.id} className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {message.sender?.full_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{message.sender?.full_name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-600 truncate">{message.content}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No recent messages</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 