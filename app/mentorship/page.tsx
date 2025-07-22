'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Star,
  Search,
  Filter,
  BookOpen,
  Code,
  Beaker,
  Calculator,
  Globe,
  Zap,
  UserCheck,
  Clock
} from 'lucide-react'

interface Mentor {
  id: string
  name: string
  title: string
  company: string
  expertise: string[]
  bio: string
  rating: number
  total_sessions: number
  hourly_rate: number
  availability: string[]
  avatar_url?: string
  is_available: boolean
}

interface MentorshipSession {
  id: string
  mentor_id: string
  student_id: string
  subject: string
  date: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
}

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [sessions, setSessions] = useState<MentorshipSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock mentors data (in a real app, this would come from the database)
  const mockMentors: Mentor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      title: 'Senior Software Engineer',
      company: 'Google',
      expertise: ['programming', 'computer-science', 'algorithms'],
      bio: 'Experienced software engineer with 10+ years in the industry. Passionate about teaching programming and helping students develop their technical skills.',
      rating: 4.9,
      total_sessions: 156,
      hourly_rate: 75,
      availability: ['Monday', 'Wednesday', 'Friday'],
      is_available: true
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      title: 'Physics Professor',
      company: 'Stanford University',
      expertise: ['physics', 'mathematics', 'research'],
      bio: 'University professor specializing in quantum physics and theoretical mathematics. Dedicated to making complex concepts accessible to students.',
      rating: 4.8,
      total_sessions: 203,
      hourly_rate: 90,
      availability: ['Tuesday', 'Thursday', 'Saturday'],
      is_available: true
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      title: 'Biotechnology Researcher',
      company: 'MIT',
      expertise: ['biology', 'chemistry', 'biotechnology'],
      bio: 'Leading researcher in biotechnology with expertise in molecular biology and genetic engineering. Enjoys mentoring students interested in life sciences.',
      rating: 4.7,
      total_sessions: 89,
      hourly_rate: 80,
      availability: ['Monday', 'Tuesday', 'Thursday'],
      is_available: true
    },
    {
      id: '4',
      name: 'James Wilson',
      title: 'Data Scientist',
      company: 'Microsoft',
      expertise: ['data-science', 'statistics', 'machine-learning'],
      bio: 'Data scientist with expertise in machine learning and statistical analysis. Passionate about helping students understand data science concepts.',
      rating: 4.6,
      total_sessions: 134,
      hourly_rate: 70,
      availability: ['Wednesday', 'Friday', 'Sunday'],
      is_available: false
    },
    {
      id: '5',
      name: 'Dr. Lisa Thompson',
      title: 'Environmental Engineer',
      company: 'Environmental Protection Agency',
      expertise: ['environmental-science', 'engineering', 'sustainability'],
      bio: 'Environmental engineer focused on sustainable solutions and green technology. Dedicated to mentoring the next generation of environmental leaders.',
      rating: 4.9,
      total_sessions: 67,
      hourly_rate: 85,
      availability: ['Tuesday', 'Wednesday', 'Saturday'],
      is_available: true
    },
    {
      id: '6',
      name: 'Alex Kim',
      title: 'Robotics Engineer',
      company: 'Boston Dynamics',
      expertise: ['robotics', 'engineering', 'mechatronics'],
      bio: 'Robotics engineer with experience in autonomous systems and mechanical design. Enjoys teaching students about robotics and automation.',
      rating: 4.5,
      total_sessions: 98,
      hourly_rate: 75,
      availability: ['Monday', 'Thursday', 'Friday'],
      is_available: true
    }
  ]

  useEffect(() => {
    checkAuth()
    setMentors(mockMentors)
    setLoading(false)
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
    } catch (error) {
      console.error('Error checking auth:', error)
    }
  }

  const expertiseAreas = [
    { id: 'all', name: 'All Expertise', icon: Users },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'physics', name: 'Physics', icon: Zap },
    { id: 'biology', name: 'Biology', icon: Beaker },
    { id: 'data-science', name: 'Data Science', icon: Calculator },
    { id: 'environmental-science', name: 'Environmental Science', icon: Globe },
    { id: 'robotics', name: 'Robotics', icon: BookOpen }
  ]

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExpertise = selectedExpertise === 'all' || mentor.expertise.includes(selectedExpertise)
    
    return matchesSearch && matchesExpertise
  })

  const getExpertiseIcon = (expertise: string) => {
    const expertiseData = expertiseAreas.find(exp => exp.id === expertise)
    return expertiseData ? expertiseData.icon : Users
  }

  const handleBookSession = (mentor: Mentor) => {
    if (!user) {
      alert('Please log in to book a mentorship session')
      return
    }
    
    if (!mentor.is_available) {
      alert('This mentor is currently not available')
      return
    }
    
    alert(`Booking session with ${mentor.name}...`)
  }

  const handleMessageMentor = (mentor: Mentor) => {
    if (!user) {
      alert('Please log in to message mentors')
      return
    }
    
    alert(`Opening chat with ${mentor.name}...`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading mentors...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
              <p className="mt-2 text-gray-600">Connect with experienced professionals and accelerate your learning</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                My Sessions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {expertiseAreas.map(expertise => (
                  <option key={expertise.id} value={expertise.id}>
                    {expertise.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <p className="text-sm text-gray-600">{mentor.title}</p>
                        <p className="text-sm text-gray-500">{mentor.company}</p>
                      </div>
                    </div>
                    <Badge variant={mentor.is_available ? "default" : "secondary"}>
                      {mentor.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Expertise:</h4>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((exp) => {
                          const ExpertiseIcon = getExpertiseIcon(exp)
                          return (
                            <Badge key={exp} variant="outline" className="text-xs">
                              <ExpertiseIcon className="w-3 h-3 mr-1" />
                              {exp.replace('-', ' ')}
                            </Badge>
                          )
                        })}
                        {mentor.expertise.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{mentor.expertise.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-3">
                      {mentor.bio}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{mentor.rating}/5.0</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{mentor.total_sessions} sessions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>${mentor.hourly_rate}/hour</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{mentor.availability.length} days/week</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        variant="outline"
                        onClick={() => handleMessageMentor(mentor)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleBookSession(mentor)}
                        disabled={!mentor.is_available}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find available mentors.</p>
          </div>
        )}
      </main>
    </div>
  )
} 