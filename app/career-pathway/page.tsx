'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GraduationCap, 
  Briefcase, 
  TrendingUp, 
  Map,
  Search,
  Filter,
  BookOpen,
  Code,
  Beaker,
  Calculator,
  Globe,
  Zap,
  ArrowRight,
  Star,
  Clock,
  DollarSign
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface CareerPath {
  id: string
  title: string
  description: string
  category: string
  education_requirements: string[]
  skills_needed: string[]
  salary_range: {
    entry: number
    experienced: number
  }
  job_outlook: 'excellent' | 'good' | 'fair' | 'declining'
  growth_rate: number
  companies: string[]
  courses: string[]
}

export default function CareerPathwayPage() {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedOutlook, setSelectedOutlook] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock career paths data (in a real app, this would come from the database)
  const mockCareerPaths: CareerPath[] = [
    {
      id: '1',
      title: 'Software Engineer',
      description: 'Design, develop, and maintain software applications and systems',
      category: 'technology',
      education_requirements: ['Bachelor\'s in Computer Science', 'Programming skills', 'Problem-solving ability'],
      skills_needed: ['Programming languages', 'Data structures', 'Algorithms', 'Software design', 'Version control'],
      salary_range: { entry: 70000, experienced: 150000 },
      job_outlook: 'excellent',
      growth_rate: 22,
      companies: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta'],
      courses: ['Introduction to Programming', 'Data Structures', 'Software Engineering', 'Database Systems']
    },
    {
      id: '2',
      title: 'Data Scientist',
      description: 'Analyze complex data to help organizations make informed decisions',
      category: 'data-science',
      education_requirements: ['Bachelor\'s in Statistics/Mathematics', 'Programming experience', 'Statistical analysis'],
      skills_needed: ['Python/R', 'Machine Learning', 'Statistics', 'Data visualization', 'SQL'],
      salary_range: { entry: 80000, experienced: 160000 },
      job_outlook: 'excellent',
      growth_rate: 36,
      companies: ['Netflix', 'Uber', 'Airbnb', 'Spotify', 'LinkedIn'],
      courses: ['Statistics', 'Machine Learning', 'Data Analysis', 'Python Programming']
    },
    {
      id: '3',
      title: 'Biomedical Engineer',
      description: 'Design and develop medical devices and healthcare technologies',
      category: 'engineering',
      education_requirements: ['Bachelor\'s in Biomedical Engineering', 'Biology knowledge', 'Engineering principles'],
      skills_needed: ['CAD software', 'Biomechanics', 'Medical device regulations', 'Research methods', 'Prototyping'],
      salary_range: { entry: 65000, experienced: 120000 },
      job_outlook: 'good',
      growth_rate: 7,
      companies: ['Medtronic', 'Johnson & Johnson', 'GE Healthcare', 'Philips', 'Siemens'],
      courses: ['Biomechanics', 'Medical Device Design', 'Biomaterials', 'Physiology']
    },
    {
      id: '4',
      title: 'Environmental Scientist',
      description: 'Study environmental problems and develop solutions for sustainability',
      category: 'environmental',
      education_requirements: ['Bachelor\'s in Environmental Science', 'Field experience', 'Research skills'],
      skills_needed: ['Environmental monitoring', 'Data analysis', 'GIS software', 'Regulatory compliance', 'Field work'],
      salary_range: { entry: 55000, experienced: 100000 },
      job_outlook: 'good',
      growth_rate: 8,
      companies: ['EPA', 'Conservation organizations', 'Consulting firms', 'Research institutions'],
      courses: ['Environmental Science', 'Ecology', 'Environmental Policy', 'Field Methods']
    },
    {
      id: '5',
      title: 'Robotics Engineer',
      description: 'Design and build robots and automated systems',
      category: 'engineering',
      education_requirements: ['Bachelor\'s in Robotics/Mechanical Engineering', 'Programming skills', 'Mechanical design'],
      skills_needed: ['CAD/CAM', 'Programming', 'Control systems', 'Mechanical design', 'Electronics'],
      salary_range: { entry: 70000, experienced: 130000 },
      job_outlook: 'excellent',
      growth_rate: 13,
      companies: ['Boston Dynamics', 'ABB', 'KUKA', 'FANUC', 'Tesla'],
      courses: ['Robotics', 'Control Systems', 'Mechanical Design', 'Programming']
    },
    {
      id: '6',
      title: 'Quantum Physicist',
      description: 'Research quantum mechanics and develop quantum technologies',
      category: 'physics',
      education_requirements: ['PhD in Physics', 'Advanced mathematics', 'Research experience'],
      skills_needed: ['Quantum mechanics', 'Advanced mathematics', 'Programming', 'Research methods', 'Theoretical physics'],
      salary_range: { entry: 90000, experienced: 180000 },
      job_outlook: 'excellent',
      growth_rate: 15,
      companies: ['IBM', 'Google', 'Microsoft', 'Intel', 'Research institutions'],
      courses: ['Quantum Mechanics', 'Advanced Mathematics', 'Physics Research', 'Computational Physics']
    }
  ]

  useEffect(() => {
    checkAuth()
    setCareerPaths(mockCareerPaths)
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
    { id: 'engineering', name: 'Engineering', icon: Zap },
    { id: 'environmental', name: 'Environmental', icon: Globe },
    { id: 'physics', name: 'Physics', icon: Beaker }
  ]

  const outlooks = [
    { id: 'all', name: 'All Outlooks' },
    { id: 'excellent', name: 'Excellent' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'declining', name: 'Declining' }
  ]

  const filteredCareerPaths = careerPaths.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.skills_needed.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || career.category === selectedCategory
    const matchesOutlook = selectedOutlook === 'all' || career.job_outlook === selectedOutlook
    
    return matchesSearch && matchesCategory && matchesOutlook
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : Briefcase
  }

  const getOutlookColor = (outlook: string) => {
    switch (outlook) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'declining': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading career pathways...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Career Pathways</h1>
              <p className="mt-2 text-gray-600">Explore exciting STEM careers and plan your professional journey</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <Map className="w-4 h-4 mr-2" />
                My Career Plan
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
                placeholder="Search careers..."
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
                value={selectedOutlook}
                onChange={(e) => setSelectedOutlook(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {outlooks.map(outlook => (
                  <option key={outlook.id} value={outlook.id}>
                    {outlook.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Career Paths Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCareerPaths.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareerPaths.map((career) => {
              const CategoryIcon = getCategoryIcon(career.category)
              
              return (
                <Card key={career.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <Badge className={getOutlookColor(career.job_outlook)}>
                          {career.job_outlook}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>{career.growth_rate}%</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{career.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>{formatSalary(career.salary_range.entry)} - {formatSalary(career.salary_range.experienced)}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Key Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {career.skills_needed.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {career.skills_needed.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{career.skills_needed.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Top Companies:</h4>
                        <div className="flex flex-wrap gap-1">
                          {career.companies.slice(0, 3).map((company, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                          {career.companies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{career.companies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Recommended Courses:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {career.courses.slice(0, 2).map((course, index) => (
                            <li key={index} className="flex items-start">
                              <BookOpen className="w-3 h-3 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                              {course}
                            </li>
                          ))}
                          {career.courses.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{career.courses.length - 2} more courses
                            </li>
                          )}
                        </ul>
                      </div>

                      <Button className="w-full">
                        Explore Career
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No career paths found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find available career paths.</p>
          </div>
        )}
      </main>
    </div>
  )
} 