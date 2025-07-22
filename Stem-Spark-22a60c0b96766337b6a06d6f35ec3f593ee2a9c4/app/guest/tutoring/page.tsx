"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Clock, 
  Calendar,
  Video,
  MessageSquare,
  Star,
  ArrowLeft,
  AlertCircle,
  Plus
} from "lucide-react"
import Link from "next/link"

export default function GuestTutoring() {
  const [guestTutoringData, setGuestTutoringData] = useState({
    upcomingSessions: 2,
    completedSessions: 8,
    totalHours: 24,
    availableTutors: 12
  })

  useEffect(() => {
    // Check if guest mode is active
    const guestMode = sessionStorage.getItem('guestMode')
    if (!guestMode) {
      window.location.href = '/'
    }
  }, [])

  const handleGuestAction = (action: string) => {
    alert(`Guest Action: ${action}\n\nThis is a demo feature. Sign up to book real tutoring sessions!`)
  }

  const tutors = [
    { name: "Dr. Sarah Chen", subject: "Python Programming", rating: 4.9, availability: "Mon, Wed, Fri", avatar: "👩‍🏫" },
    { name: "Prof. Mike Johnson", subject: "Web Development", rating: 4.8, availability: "Tue, Thu, Sat", avatar: "👨‍🏫" },
    { name: "Dr. Emily Rodriguez", subject: "Data Science", rating: 4.7, availability: "Mon, Tue, Thu", avatar: "👩‍💻" },
    { name: "Alex Thompson", subject: "JavaScript", rating: 4.6, availability: "Wed, Fri, Sun", avatar: "👨‍💻" }
  ]

  const upcomingSessions = [
    { tutor: "Dr. Sarah Chen", subject: "Python Programming", date: "Tomorrow", time: "2:00 PM", duration: "1 hour" },
    { tutor: "Prof. Mike Johnson", subject: "Web Development", date: "Friday", time: "10:00 AM", duration: "1.5 hours" }
  ]

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
                <h1 className="text-2xl font-bold text-gray-900">Tutoring Sessions</h1>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{guestTutoringData.upcomingSessions}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{guestTutoringData.completedSessions}</p>
                </div>
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{guestTutoringData.totalHours}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Tutors</p>
                  <p className="text-2xl font-bold text-gray-900">{guestTutoringData.availableTutors}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Book sessions and manage your tutoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => handleGuestAction('Book New Session')}
                className="h-16 flex-col"
              >
                <Plus className="w-6 h-6 mb-2" />
                <span>Book New Session</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleGuestAction('View Available Tutors')}
                className="h-16 flex-col"
              >
                <Users className="w-6 h-6 mb-2" />
                <span>Browse Tutors</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleGuestAction('View Session History')}
                className="h-16 flex-col"
              >
                <Clock className="w-6 h-6 mb-2" />
                <span>Session History</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Sessions
              </CardTitle>
              <CardDescription>Your scheduled tutoring sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{session.tutor}</h3>
                    <Badge variant="outline">{session.duration}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{session.subject}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {session.date} at {session.time}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleGuestAction(`Join Session with ${session.tutor}`)}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Session
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGuestAction(`Reschedule with ${session.tutor}`)}
                    >
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Tutors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Available Tutors
              </CardTitle>
              <CardDescription>Book sessions with expert tutors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tutors.map((tutor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{tutor.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{tutor.name}</h3>
                      <p className="text-sm text-gray-600">{tutor.subject}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{tutor.rating}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Available: {tutor.availability}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => handleGuestAction(`Book Session with ${tutor.name}`)}
                    className="w-full"
                  >
                    Book Session
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Guest Mode Notice */}
        <Card className="mt-8 bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Guest Mode Active</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a demo experience. You can explore the tutoring features, but you cannot book real sessions. 
                  Sign up for a real account to access live tutoring with expert instructors.
                </p>
                <div className="mt-3">
                  <Link href="/sign%20up">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Star className="w-4 h-4 mr-2" />
                      Sign Up for Real Tutoring
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