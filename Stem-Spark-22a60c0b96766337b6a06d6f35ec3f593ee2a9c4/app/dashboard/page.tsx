"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import { 
  Users, 
  BookOpen, 
  Trophy, 
  TestTube, 
  Bot, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Star, 
  Target, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  Play,
  Zap,
  Brain,
  Lightbulb,
  GraduationCap,
  Video,
  FileText,
  Settings,
  Bell,
  User,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

interface UserStats {
  totalHours: number
  completedCourses: number
  activeCompetitions: number
  mentorshipSessions: number
  achievements: number
  rank: string
}

interface RecentActivity {
  id: string
  type: 'course' | 'competition' | 'mentorship' | 'lab' | 'tutoring'
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'in-progress' | 'upcoming'
  icon: React.ReactNode
}

interface QuickAction {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  color: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState<UserStats>({
    totalHours: 0,
    completedCourses: 0,
    activeCompetitions: 0,
    mentorshipSessions: 0,
    achievements: 0,
    rank: "Beginner"
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Fetch user stats and activities
        fetchUserData(user.id)
      }
    }
    checkAuth()
  }, [])

  const fetchUserData = async (userId: string) => {
    // Simulate fetching user data
    setUserStats({
      totalHours: 45,
      completedCourses: 3,
      activeCompetitions: 2,
      mentorshipSessions: 1,
      achievements: 8,
      rank: "Intermediate"
    })

    setRecentActivities([
      {
        id: "1",
        type: "course",
        title: "Advanced Python Programming",
        description: "Completed Module 3: Data Structures",
        timestamp: "2 hours ago",
        status: "completed",
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        id: "2",
        type: "competition",
        title: "Robotics Innovation Challenge",
        description: "Submitted project proposal",
        timestamp: "1 day ago",
        status: "in-progress",
        icon: <Trophy className="w-4 h-4" />
      },
      {
        id: "3",
        type: "mentorship",
        title: "Session with Dr. Sarah Chen",
        description: "Machine Learning guidance",
        timestamp: "3 days ago",
        status: "completed",
        icon: <Users className="w-4 h-4" />
      },
      {
        id: "4",
        type: "lab",
        title: "Chemistry Lab: Acid-Base Titration",
        description: "Experiment completed successfully",
        timestamp: "1 week ago",
        status: "completed",
        icon: <TestTube className="w-4 h-4" />
      }
    ])
  }

  const quickActions: QuickAction[] = [
    {
      id: "ai-tutor",
      title: "AI Tutor",
      description: "Get personalized help with STEM subjects",
      href: "/ai-tutor",
      icon: <Bot className="w-6 h-6" />,
      color: "from-blue-500 to-purple-600"
    },
    {
      id: "virtual-lab",
      title: "Virtual Lab",
      description: "Conduct safe experiments online",
      href: "/virtual-lab",
      icon: <TestTube className="w-6 h-6" />,
      color: "from-green-500 to-blue-600"
    },
    {
      id: "competitions",
      title: "Competitions",
      description: "Compete and win prizes",
      href: "/competitions",
      icon: <Trophy className="w-6 h-6" />,
      color: "from-yellow-500 to-orange-600"
    },
    {
      id: "mentorship",
      title: "Mentorship",
      description: "Connect with industry experts",
      href: "/mentorship",
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: "communication",
      title: "Communication Hub",
      description: "Chat with peers and mentors",
      href: "/communication-hub",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: "tutoring",
      title: "Tutoring Sessions",
      description: "Book one-on-one tutoring",
      href: "/tutoring",
      icon: <GraduationCap className="w-6 h-6" />,
      color: "from-teal-500 to-cyan-600"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'in-progress': return 'text-yellow-400'
      case 'upcoming': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'upcoming': return <Calendar className="w-4 h-4 text-blue-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  if (!user) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
          </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-x-hidden">
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/">
                <Logo variant="nav" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.user_metadata?.full_name || 'Student'}! 👋
          </h1>
            <p className="text-xl text-blue-100">
              Continue your STEM journey with our latest features and tools.
          </p>
        </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Total Hours</p>
                    <p className="text-3xl font-bold text-white">{userStats.totalHours}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Completed Courses</p>
                    <p className="text-3xl font-bold text-white">{userStats.completedCourses}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Achievements</p>
                    <p className="text-3xl font-bold text-white">{userStats.achievements}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Active Competitions</p>
                    <p className="text-3xl font-bold text-white">{userStats.activeCompetitions}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                </CardContent>
              </Card>

            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Mentorship Sessions</p>
                    <p className="text-3xl font-bold text-white">{userStats.mentorshipSessions}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                </CardContent>
              </Card>

            <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-sm">Current Rank</p>
                    <p className="text-3xl font-bold text-white">{userStats.rank}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-white flex items-center">
                    <Zap className="w-6 h-6 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {quickActions.map((action) => (
                      <Link key={action.id} href={action.href}>
                        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 cursor-pointer group">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                {action.icon}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">
                                  {action.title}
                                </h3>
                                <p className="text-sm text-blue-200">
                                  {action.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
                  </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="text-blue-300 mt-1">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-blue-200 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-blue-300">
                            {activity.timestamp}
                          </span>
                          {getStatusIcon(activity.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Content */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Content</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Learning</h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Get personalized help with our AI tutor for any STEM subject.
                  </p>
                  <Link href="/ai-tutor">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                    <TestTube className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Virtual Laboratory</h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Conduct safe experiments in our virtual lab environment.
                  </p>
                  <Link href="/virtual-lab">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Experiment
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">STEM Competitions</h3>
                  <p className="text-blue-200 text-sm mb-4">
                    Compete with peers and win exciting prizes.
                  </p>
                  <Link href="/competitions">
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      View Competitions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
                </div>
              </div>
      </main>
    </div>
  )
}
