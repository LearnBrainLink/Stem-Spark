'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Users, 
  Calendar, 
  MessageSquare,
  Play,
  Star,
  ArrowRight,
  LogOut,
  Settings,
  Bell,
  GraduationCap,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string
  role: string
  grade?: number
  school_institution?: string
  total_volunteer_hours?: number
  last_active?: string
}

interface Course {
  id: string
  title: string
  description: string
  progress: number
  instructor: string
  category: string
  duration: number
}

interface TutoringSession {
  id: string
  tutor_name: string
  subject: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface Message {
  id: string
  sender_name: string
  content: string
  timestamp: string
  unread: boolean
}

export default function StudentDashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [tutoringSessions, setTutoringSessions] = useState<TutoringSession[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState({
    coursesInProgress: 0,
    completedCourses: 0,
    totalHours: 0,
    upcomingSessions: 0,
    achievements: 0,
    unreadMessages: 0
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      console.log('Auth result:', { authUser: !!authUser, error: authError })
      
      if (authError) {
        console.error('Auth error:', authError)
        setLoading(false)
        return
      }

      if (!authUser) {
        console.log('No authenticated user found')
        setLoading(false)
        return
      }

      console.log('User authenticated:', authUser.email)

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      console.log('Profile result:', { profile: !!profile, error: profileError })

      if (profileError) {
        console.error('Profile error:', profileError)
        setLoading(false)
        return
      }

      if (!profile) {
        console.error('No profile found')
        setLoading(false)
        return
      }

      console.log('Profile loaded:', profile)
      setUser(profile)

      // Load dashboard data
      await loadDashboardData(authUser.id)
      
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async (userId: string) => {
    try {
      // Load courses (simulated data for now)
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Introduction to Python Programming',
          description: 'Learn the fundamentals of Python programming language',
          progress: 75,
          instructor: 'Dr. Sarah Chen',
          category: 'Programming',
          duration: 40
        },
        {
          id: '2',
          title: 'Web Development Fundamentals',
          description: 'Build modern websites with HTML, CSS, and JavaScript',
          progress: 45,
          instructor: 'Prof. Mike Johnson',
          category: 'Web Development',
          duration: 60
        },
        {
          id: '3',
          title: 'Data Science Basics',
          description: 'Introduction to data analysis and visualization',
          progress: 20,
          instructor: 'Dr. Emily Rodriguez',
          category: 'Data Science',
          duration: 50
        }
      ]
      setCourses(mockCourses)

      // Load tutoring sessions from database
      const { data: sessions, error: sessionsError } = await supabase
        .from('tutoring_sessions')
        .select(`
          id,
          subject,
          session_date,
          duration_minutes,
          status,
          tutors:profiles!tutoring_sessions_tutor_id_fkey(full_name)
        `)
        .eq('student_id', userId)
        .order('session_date', { ascending: true })

      if (!sessionsError && sessions) {
        const formattedSessions: TutoringSession[] = sessions.map(session => ({
          id: session.id,
          tutor_name: session.tutors?.full_name || 'Unknown Tutor',
          subject: session.subject,
          date: new Date(session.session_date).toLocaleDateString(),
          time: new Date(session.session_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: session.duration_minutes,
          status: session.status
        }))
        setTutoringSessions(formattedSessions)
      }

      // Load messages from database
      const { data: chatMessages, error: messagesError } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          created_at,
          sender:profiles!chat_messages_sender_id_fkey(full_name)
        `)
        .eq('channel_id', 'general') // Assuming general channel
        .order('created_at', { ascending: false })
        .limit(5)

      if (!messagesError && chatMessages) {
        const formattedMessages: Message[] = chatMessages.map(msg => ({
          id: msg.id,
          sender_name: msg.sender?.full_name || 'Unknown User',
          content: msg.content,
          timestamp: new Date(msg.created_at).toLocaleString(),
          unread: false // You can implement unread logic
        }))
        setMessages(formattedMessages)
      }

      // Calculate stats
      setStats({
        coursesInProgress: mockCourses.filter(c => c.progress < 100).length,
        completedCourses: mockCourses.filter(c => c.progress === 100).length,
        totalHours: user?.total_volunteer_hours || 0,
        upcomingSessions: formattedSessions?.filter(s => s.status === 'scheduled').length || 0,
        achievements: 5, // Mock data
        unreadMessages: formattedMessages?.filter(m => m.unread).length || 0
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Sign out error:', error)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to access the Student Dashboard</p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">This dashboard is only for students</p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Back to Home
            </Button>
          </Link>
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
            <div className="flex items-center">
              <Image
                src="/images/novakinetix-logo.png"
                alt="Novakinetix Academy Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <div>
                <span className="text-xl font-bold text-gray-900">Student Dashboard</span>
                <p className="text-sm text-gray-500">Welcome back, {user.full_name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to NovaKinetix Academy! 🎓
                </h2>
                <p className="text-gray-600 mb-4">
                  Continue your learning journey and track your progress across all courses and activities.
                </p>
                <div className="flex space-x-3">
                  <Link href="/learning-path">
                    <Button>
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </Link>
                  <Link href="/communication-hub">
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{stats.totalHours}</div>
                <div className="text-sm text-gray-500">Hours Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Courses in Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.coursesInProgress}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Current Courses
              </CardTitle>
              <CardDescription>Continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Instructor: {course.instructor}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <Link href={`/learning-path?course=${course.id}`}>
                    <Button size="sm" className="w-full">
                      Continue Learning
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest learning activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { action: "Completed Python Quiz", time: "2 hours ago", icon: "🎯" },
                { action: "Joined Study Group", time: "1 day ago", icon: "👥" },
                { action: "Watched Video Tutorial", time: "2 days ago", icon: "📹" },
                { action: "Submitted Assignment", time: "3 days ago", icon: "📝" },
                { action: "Earned Achievement Badge", time: "1 week ago", icon: "🏆" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/tutoring">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Schedule Tutoring</span>
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Trophy className="w-6 h-6 mb-2" />
                  <span className="text-sm">Join Competition</span>
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span className="text-sm">View Calendar</span>
                </Button>
              </Link>
              <Link href="/communication-hub">
                <Button variant="outline" className="h-20 flex-col w-full">
                  <MessageSquare className="w-6 h-6 mb-2" />
                  <span className="text-sm">Messages</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
