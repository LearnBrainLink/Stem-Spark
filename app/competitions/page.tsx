'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Calendar, 
  Users, 
  Award,
  Clock,
  Star,
  Target,
  Zap,
  BookOpen,
  Code,
  Beaker,
  Calculator
} from 'lucide-react'

interface Competition {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  prize_description: string
  requirements: string[]
  is_registration_open: boolean
  status: 'upcoming' | 'active' | 'completed'
}

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock competitions data (in a real app, this would come from the database)
  const mockCompetitions: Competition[] = [
    {
      id: '1',
      title: 'NovaKinetix STEM Innovation Challenge',
      description: 'Design and build an innovative solution to address real-world problems using STEM principles',
      category: 'engineering',
      difficulty_level: 'advanced',
      start_date: '2024-02-01',
      end_date: '2024-04-15',
      max_participants: 100,
      current_participants: 45,
      prize_description: 'Cash prizes, mentorship opportunities, and recognition',
      requirements: ['Open to high school students', 'Team of 2-4 students', 'Original project concept'],
      is_registration_open: true,
      status: 'active'
    },
    {
      id: '2',
      title: 'Mathematics Olympiad',
      description: 'Test your mathematical skills in this challenging competition covering algebra, geometry, and calculus',
      category: 'mathematics',
      difficulty_level: 'intermediate',
      start_date: '2024-03-01',
      end_date: '2024-03-15',
      max_participants: 200,
      current_participants: 120,
      prize_description: 'Certificates, medals, and scholarship opportunities',
      requirements: ['Individual participation', 'Advanced math knowledge', 'Online proctored exam'],
      is_registration_open: true,
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Science Fair Project Competition',
      description: 'Present your scientific research and discoveries in this annual science fair',
      category: 'science',
      difficulty_level: 'beginner',
      start_date: '2024-01-15',
      end_date: '2024-05-20',
      max_participants: 150,
      current_participants: 89,
      prize_description: 'Lab equipment, research grants, and science camp opportunities',
      requirements: ['Original research project', 'Written report', 'Poster presentation'],
      is_registration_open: true,
      status: 'active'
    },
    {
      id: '4',
      title: 'Coding Challenge',
      description: 'Solve complex programming problems and demonstrate your coding skills',
      category: 'programming',
      difficulty_level: 'intermediate',
      start_date: '2024-02-15',
      end_date: '2024-02-28',
      max_participants: 80,
      current_participants: 80,
      prize_description: 'Gift cards, coding bootcamp scholarships, and tech internships',
      requirements: ['Programming experience', 'Online coding environment', 'Time-limited challenges'],
      is_registration_open: false,
      status: 'completed'
    },
    {
      id: '5',
      title: 'Physics Design Challenge',
      description: 'Design and test physics-based solutions to engineering problems',
      category: 'physics',
      difficulty_level: 'advanced',
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      max_participants: 60,
      current_participants: 23,
      prize_description: 'Physics lab equipment, university connections, and research opportunities',
      requirements: ['Physics knowledge', 'Design skills', 'Prototype development'],
      is_registration_open: true,
      status: 'upcoming'
    },
    {
      id: '6',
      title: 'Environmental Science Competition',
      description: 'Develop solutions for environmental challenges and sustainability',
      category: 'environmental',
      difficulty_level: 'beginner',
      start_date: '2024-03-15',
      end_date: '2024-05-15',
      max_participants: 120,
      current_participants: 67,
      prize_description: 'Environmental projects funding, field trips, and conservation opportunities',
      requirements: ['Environmental awareness', 'Solution-oriented thinking', 'Presentation skills'],
      is_registration_open: true,
      status: 'upcoming'
    }
  ]

  useEffect(() => {
    checkAuth()
    setCompetitions(mockCompetitions)
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

  const categories = [
    { id: 'all', name: 'All Categories', icon: Trophy },
    { id: 'engineering', name: 'Engineering', icon: Target },
    { id: 'mathematics', name: 'Mathematics', icon: Calculator },
    { id: 'science', name: 'Science', icon: Beaker },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'physics', name: 'Physics', icon: Zap },
    { id: 'environmental', name: 'Environmental', icon: BookOpen }
  ]

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'active', name: 'Active' },
    { id: 'completed', name: 'Completed' }
  ]

  const filteredCompetitions = competitions.filter(competition => {
    const matchesCategory = selectedCategory === 'all' || competition.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || competition.status === selectedStatus
    
    return matchesCategory && matchesStatus
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : Trophy
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleRegister = (competition: Competition) => {
    if (!user) {
      alert('Please log in to register for competitions')
      return
    }
    
    if (!competition.is_registration_open) {
      alert('Registration is not open for this competition')
      return
    }
    
    alert(`Registration successful for ${competition.title}!`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading competitions...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">STEM Competitions</h1>
              <p className="mt-2 text-gray-600">Challenge yourself and compete with peers in exciting STEM competitions</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <Trophy className="w-4 h-4 mr-2" />
                My Competitions
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Competitions Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCompetitions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => {
              const CategoryIcon = getCategoryIcon(competition.category)
              
              return (
                <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <Badge className={getDifficultyColor(competition.difficulty_level)}>
                          {competition.difficulty_level}
                        </Badge>
                      </div>
                      <Badge className={getStatusColor(competition.status)}>
                        {competition.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{competition.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {competition.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(competition.start_date)} - {formatDate(competition.end_date)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{competition.current_participants}/{competition.max_participants} participants</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Prizes:</h4>
                        <p className="text-sm text-gray-600">{competition.prize_description}</p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {competition.requirements.slice(0, 2).map((requirement, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="w-3 h-3 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                              {requirement}
                            </li>
                          ))}
                          {competition.requirements.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{competition.requirements.length - 2} more requirements
                            </li>
                          )}
                        </ul>
                      </div>

                      <Button 
                        className="w-full" 
                        variant={competition.is_registration_open ? "default" : "outline"}
                        onClick={() => handleRegister(competition)}
                        disabled={!competition.is_registration_open}
                      >
                        {competition.is_registration_open ? (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Register Now
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Registration Closed
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No competitions found</h3>
            <p className="text-gray-600">Try adjusting your filters to find available competitions.</p>
          </div>
        )}
      </main>
    </div>
  )
} 