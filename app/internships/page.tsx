'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar,
  DollarSign,
  Clock,
  Search,
  Filter,
  BookOpen,
  Code,
  Beaker,
  Calculator,
  Globe,
  Zap,
  Star,
  Users,
  ArrowRight
} from 'lucide-react'

interface Internship {
  id: string
  title: string
  company: string
  location: string
  description: string
  category: string
  duration: string
  stipend: {
    min: number
    max: number
    currency: string
  }
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  application_deadline: string
  start_date: string
  is_remote: boolean
  is_part_time: boolean
  company_logo?: string
  application_count: number
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock internships data (in a real app, this would come from the database)
  const mockInternships: Internship[] = [
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'Google',
      location: 'Mountain View, CA',
      description: 'Join our engineering team to develop innovative software solutions and gain hands-on experience with cutting-edge technologies.',
      category: 'technology',
      duration: '12 weeks',
      stipend: { min: 8000, max: 12000, currency: 'USD' },
      requirements: ['Programming experience', 'Computer Science major', 'Strong problem-solving skills'],
      responsibilities: ['Develop software features', 'Collaborate with team', 'Participate in code reviews'],
      benefits: ['Competitive salary', 'Housing allowance', 'Professional development', 'Networking opportunities'],
      application_deadline: '2024-03-15',
      start_date: '2024-06-01',
      is_remote: false,
      is_part_time: false,
      application_count: 245
    },
    {
      id: '2',
      title: 'Data Science Research Intern',
      company: 'Microsoft',
      location: 'Seattle, WA',
      description: 'Work on cutting-edge machine learning projects and contribute to research that impacts millions of users worldwide.',
      category: 'data-science',
      duration: '10 weeks',
      stipend: { min: 7000, max: 10000, currency: 'USD' },
      requirements: ['Python programming', 'Machine learning knowledge', 'Statistics background'],
      responsibilities: ['Conduct data analysis', 'Develop ML models', 'Present findings'],
      benefits: ['Research experience', 'Mentorship', 'Publication opportunities', 'Competitive pay'],
      application_deadline: '2024-03-01',
      start_date: '2024-05-15',
      is_remote: true,
      is_part_time: false,
      application_count: 189
    },
    {
      id: '3',
      title: 'Environmental Science Intern',
      company: 'Environmental Protection Agency',
      location: 'Washington, DC',
      description: 'Contribute to environmental research and policy development while gaining valuable experience in environmental protection.',
      category: 'environmental',
      duration: '8 weeks',
      stipend: { min: 5000, max: 7000, currency: 'USD' },
      requirements: ['Environmental Science major', 'Field work experience', 'Strong writing skills'],
      responsibilities: ['Conduct field research', 'Analyze environmental data', 'Write reports'],
      benefits: ['Government experience', 'Field work', 'Policy exposure', 'Networking'],
      application_deadline: '2024-02-28',
      start_date: '2024-06-01',
      is_remote: false,
      is_part_time: true,
      application_count: 134
    },
    {
      id: '4',
      title: 'Biotechnology Research Intern',
      company: 'Genentech',
      location: 'South San Francisco, CA',
      description: 'Join our research team to work on breakthrough therapies and contribute to life-saving medical innovations.',
      category: 'science',
      duration: '12 weeks',
      stipend: { min: 6000, max: 9000, currency: 'USD' },
      requirements: ['Biology/Chemistry major', 'Lab experience', 'Attention to detail'],
      responsibilities: ['Conduct laboratory experiments', 'Analyze data', 'Maintain lab equipment'],
      benefits: ['Lab experience', 'Mentorship', 'Healthcare benefits', 'Career development'],
      application_deadline: '2024-03-10',
      start_date: '2024-06-01',
      is_remote: false,
      is_part_time: false,
      application_count: 167
    },
    {
      id: '5',
      title: 'Robotics Engineering Intern',
      company: 'Boston Dynamics',
      location: 'Waltham, MA',
      description: 'Work on cutting-edge robotics technology and contribute to the development of advanced autonomous systems.',
      category: 'engineering',
      duration: '10 weeks',
      stipend: { min: 7000, max: 11000, currency: 'USD' },
      requirements: ['Engineering major', 'Programming skills', 'Mechanical aptitude'],
      responsibilities: ['Design robot components', 'Test prototypes', 'Document processes'],
      benefits: ['Hands-on experience', 'Innovation exposure', 'Competitive salary', 'Future opportunities'],
      application_deadline: '2024-03-20',
      start_date: '2024-06-01',
      is_remote: false,
      is_part_time: false,
      application_count: 98
    },
    {
      id: '6',
      title: 'Mathematics Research Intern',
      company: 'MIT',
      location: 'Cambridge, MA',
      description: 'Participate in mathematical research projects and work alongside world-renowned mathematicians.',
      category: 'mathematics',
      duration: '8 weeks',
      stipend: { min: 4000, max: 6000, currency: 'USD' },
      requirements: ['Mathematics major', 'Strong analytical skills', 'Research interest'],
      responsibilities: ['Conduct mathematical research', 'Write proofs', 'Present findings'],
      benefits: ['Academic experience', 'Research publication', 'Faculty mentorship', 'Academic credit'],
      application_deadline: '2024-02-15',
      start_date: '2024-06-01',
      is_remote: false,
      is_part_time: true,
      application_count: 76
    }
  ]

  useEffect(() => {
    checkAuth()
    setInternships(mockInternships)
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
    { id: 'all', name: 'All Categories', icon: Briefcase },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'data-science', name: 'Data Science', icon: Calculator },
    { id: 'environmental', name: 'Environmental', icon: Globe },
    { id: 'science', name: 'Science', icon: Beaker },
    { id: 'engineering', name: 'Engineering', icon: Zap },
    { id: 'mathematics', name: 'Mathematics', icon: BookOpen }
  ]

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'remote', name: 'Remote' },
    { id: 'california', name: 'California' },
    { id: 'washington', name: 'Washington' },
    { id: 'massachusetts', name: 'Massachusetts' },
    { id: 'dc', name: 'Washington, DC' }
  ]

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || internship.category === selectedCategory
    const matchesLocation = selectedLocation === 'all' || 
                           (selectedLocation === 'remote' && internship.is_remote) ||
                           internship.location.toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : Briefcase
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleApply = (internship: Internship) => {
    if (!user) {
      alert('Please log in to apply for internships')
      return
    }
    
    alert(`Application submitted for ${internship.title} at ${internship.company}!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading internships...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Internships</h1>
              <p className="mt-2 text-gray-600">Find exciting internship opportunities in STEM fields</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <Briefcase className="w-4 h-4 mr-2" />
                My Applications
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
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
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
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Internships Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredInternships.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship) => {
              const CategoryIcon = getCategoryIcon(internship.category)
              
              return (
                <Card key={internship.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <Badge variant={internship.is_remote ? "default" : "secondary"}>
                          {internship.is_remote ? 'Remote' : 'On-site'}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{internship.application_count} applicants</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{internship.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      <span>{internship.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{internship.location}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {internship.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{internship.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{formatSalary(internship.stipend.min, internship.stipend.max, internship.stipend.currency)}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Requirements:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {internship.requirements.slice(0, 2).map((req, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="w-3 h-3 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                          {internship.requirements.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{internship.requirements.length - 2} more requirements
                            </li>
                          )}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>Apply by {formatDate(internship.application_deadline)}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handleApply(internship)}
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find available internships.</p>
          </div>
        )}
      </main>
    </div>
  )
} 