"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Users, 
  Calendar, 
  MessageSquare,
  Play,
  Star,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function GuestDashboard() {
  const [guestData, setGuestData] = useState({
    coursesInProgress: 3,
    completedCourses: 1,
    totalHours: 12,
    upcomingSessions: 2,
    achievements: 5,
    messages: 3
  })

  useEffect(() => {
    // Check if guest mode is active
    const guestMode = sessionStorage.getItem('guestMode')
    if (!guestMode) {
      window.location.href = '/'
    }
  }, [])

  const handleGuestAction = (action: string) => {
    // Simulate guest action without storing data
    alert(`Guest Action: ${action}\n\nThis is a demo feature. Sign up to save your progress!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="text-sm text-gray-500">Guest Mode - Demo Experience</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Guest Mode
            </Badge>
          </div>
        </div>
      </div>

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
                  This is your student dashboard. Try out all the features below. 
                  Your progress will be saved only if you sign up for a real account.
                </p>
                <div className="flex space-x-3">
                  <Button onClick={() => handleGuestAction('Start Learning')}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Learning
                  </Button>
                  <Button variant="outline" onClick={() => handleGuestAction('View Profile')}>
                    <Users className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{guestData.totalHours}</div>
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
                  <p className="text-2xl font-bold text-gray-900">{guestData.coursesInProgress}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{guestData.completedCourses}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{guestData.upcomingSessions}</p>
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
                  <p className="text-2xl font-bold text-gray-900">{guestData.messages}</p>
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
              {[
                { name: "Introduction to Python", progress: 75, instructor: "Dr. Sarah Chen" },
                { name: "Web Development Fundamentals", progress: 45, instructor: "Prof. Mike Johnson" },
                { name: "Data Science Basics", progress: 20, instructor: "Dr. Emily Rodriguez" }
              ].map((course, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{course.name}</h3>
                    <Badge variant="outline">{course.progress}%</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Instructor: {course.instructor}</p>
                  <Progress value={course.progress} className="mb-3" />
                  <Button 
                    size="sm" 
                    onClick={() => handleGuestAction(`Continue ${course.name}`)}
                    className="w-full"
                  >
                    Continue Learning
                  </Button>
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
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleGuestAction('Schedule Tutoring')}
              >
                <Users className="w-6 h-6 mb-2" />
                <span className="text-sm">Schedule Tutoring</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleGuestAction('Join Competition')}
              >
                <Trophy className="w-6 h-6 mb-2" />
                <span className="text-sm">Join Competition</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleGuestAction('View Calendar')}
              >
                <Calendar className="w-6 h-6 mb-2" />
                <span className="text-sm">View Calendar</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => handleGuestAction('Open Messages')}
              >
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm">Messages</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Guest Mode Notice */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Guest Mode Active</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a demo experience. Your progress and data will not be saved. 
                  Sign up for a real account to save your progress and access all features permanently.
                </p>
                <div className="mt-3">
                  <Link href="/sign%20up">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Star className="w-4 h-4 mr-2" />
                      Sign Up to Save Progress
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 