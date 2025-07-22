'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Calendar, 
  Clock,
  BookOpen,
  Star,
  CheckCircle,
  Plus,
  Search,
  ArrowRight,
  MessageCircle
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function TutoringPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tutors, setTutors] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

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
      await loadTutoringData(authUser.id)
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

  const loadTutoringData = async (userId: string) => {
    try {
      // Load available tutors (interns)
      const { data: tutorData, error: tutorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'intern')
        .order('full_name', { ascending: true })

      if (!tutorError && tutorData) {
        setTutors(tutorData)
      }

      // Load user's tutoring sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('tutoring_sessions')
        .select(`
          *,
          intern:profiles!tutoring_sessions_intern_id_fkey(full_name)
        `)
        .eq('student_id', userId)
        .order('scheduled_time', { ascending: true })

      if (!sessionError && sessionData) {
        setSessions(sessionData)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error in loadTutoringData:', error)
      setLoading(false)
    }
  }

  const handleBookSession = async () => {
    if (!selectedSubject || !selectedDate || !selectedTime) {
      alert('Please fill in all fields')
      return
    }

    try {
      const scheduledTime = new Date(`${selectedDate}T${selectedTime}`).toISOString()
      
      const { data, error } = await supabase
        .from('tutoring_sessions')
        .insert({
          student_id: user.id,
          intern_id: tutors[0]?.id, // For now, assign to first available tutor
          subject: selectedSubject,
          scheduled_time: scheduledTime,
          duration_minutes: 60,
          status: 'scheduled'
        })

      if (error) {
        console.error('Error booking session:', error)
        alert('Failed to book session')
      } else {
        alert('Session booked successfully!')
        setSelectedSubject('')
        setSelectedDate('')
        setSelectedTime('')
        await loadTutoringData(user.id)
      }
    } catch (error) {
      console.error('Error in handleBookSession:', error)
      alert('Failed to book session')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading tutoring...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tutoring Sessions</h1>
          <p className="text-gray-600 mt-2">Book sessions with our qualified tutors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book New Session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Book New Session
              </CardTitle>
              <CardDescription>
                Schedule a tutoring session with one of our tutors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  placeholder="e.g., Mathematics, Science, Programming"
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                />
              </div>
              <Button onClick={handleBookSession} className="w-full">
                Book Session
              </Button>
            </CardContent>
          </Card>

          {/* Available Tutors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Available Tutors
              </CardTitle>
              <CardDescription>
                Our qualified tutors are ready to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-blue-600">
                        {tutor.full_name?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{tutor.full_name}</h3>
                      <p className="text-sm text-gray-600">{tutor.email}</p>
                      <div className="flex items-center mt-1 space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">4.8</span>
                        </div>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-600">50+ sessions</span>
                      </div>
                    </div>
                    <Badge variant="outline">Available</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Sessions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              My Sessions
            </CardTitle>
            <CardDescription>
              Your scheduled and completed tutoring sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{session.subject}</h3>
                        <p className="text-sm text-gray-600">
                          with {session.intern?.full_name || 'Unknown Tutor'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.scheduled_time).toLocaleDateString()} at{' '}
                          {new Date(session.scheduled_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={session.status === 'completed' ? 'default' : 
                               session.status === 'scheduled' ? 'secondary' : 'destructive'}
                      >
                        {session.status}
                      </Badge>
                      {session.status === 'scheduled' && (
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sessions scheduled yet</p>
                  <p className="text-sm text-gray-500 mt-1">Book your first session above</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 