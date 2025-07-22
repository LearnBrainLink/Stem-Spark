'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  FolderOpen, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2,
  Search,
  Filter,
  BookOpen,
  Code,
  Beaker,
  Calculator,
  Globe,
  Zap,
  Star,
  Calendar,
  Users
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  author: {
    name: string
    role: string
    avatar_url?: string
  }
  created_at: string
  views: number
  likes: number
  comments: number
  tags: string[]
  project_url?: string
  github_url?: string
  images: string[]
  technologies: string[]
}

export default function ProjectShowcasePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock projects data (in a real app, this would come from the database)
  const mockProjects: Project[] = [
    {
      id: '1',
      title: 'Smart Home Automation System',
      description: 'A comprehensive IoT-based home automation system that controls lighting, temperature, and security using Arduino and mobile app.',
      category: 'engineering',
      difficulty_level: 'advanced',
      author: {
        name: 'Alex Chen',
        role: 'High School Student',
        avatar_url: '/avatars/alex.jpg'
      },
      created_at: '2024-01-15',
      views: 1247,
      likes: 89,
      comments: 23,
      tags: ['IoT', 'Arduino', 'Mobile App', 'Automation'],
      project_url: 'https://project-demo.com/smart-home',
      github_url: 'https://github.com/alexchen/smart-home',
      images: ['/projects/smart-home-1.jpg', '/projects/smart-home-2.jpg'],
      technologies: ['Arduino', 'React Native', 'Node.js', 'MongoDB']
    },
    {
      id: '2',
      title: 'Machine Learning Weather Predictor',
      description: 'A machine learning model that predicts weather patterns using historical data and real-time atmospheric conditions.',
      category: 'data-science',
      difficulty_level: 'intermediate',
      author: {
        name: 'Sarah Johnson',
        role: 'College Student',
        avatar_url: '/avatars/sarah.jpg'
      },
      created_at: '2024-01-20',
      views: 892,
      likes: 67,
      comments: 15,
      tags: ['Machine Learning', 'Python', 'Weather', 'Data Analysis'],
      project_url: 'https://project-demo.com/weather-predictor',
      github_url: 'https://github.com/sarahj/weather-ml',
      images: ['/projects/weather-1.jpg'],
      technologies: ['Python', 'TensorFlow', 'Pandas', 'Scikit-learn']
    },
    {
      id: '3',
      title: 'Eco-Friendly Water Filtration System',
      description: 'A sustainable water filtration system using natural materials and solar power for rural communities.',
      category: 'environmental',
      difficulty_level: 'intermediate',
      author: {
        name: 'Maria Rodriguez',
        role: 'High School Student',
        avatar_url: '/avatars/maria.jpg'
      },
      created_at: '2024-01-10',
      views: 1567,
      likes: 134,
      comments: 31,
      tags: ['Sustainability', 'Water Filtration', 'Solar Power', 'Community'],
      project_url: 'https://project-demo.com/water-filter',
      github_url: 'https://github.com/mariar/eco-filter',
      images: ['/projects/water-filter-1.jpg', '/projects/water-filter-2.jpg'],
      technologies: ['3D Printing', 'Solar Panels', 'Filtration Materials']
    },
    {
      id: '4',
      title: 'Virtual Reality Physics Lab',
      description: 'An immersive VR experience for conducting physics experiments in a safe, virtual environment.',
      category: 'technology',
      difficulty_level: 'advanced',
      author: {
        name: 'David Kim',
        role: 'College Student',
        avatar_url: '/avatars/david.jpg'
      },
      created_at: '2024-01-25',
      views: 743,
      likes: 56,
      comments: 12,
      tags: ['Virtual Reality', 'Physics', 'Education', 'Unity'],
      project_url: 'https://project-demo.com/vr-physics',
      github_url: 'https://github.com/davidk/vr-physics-lab',
      images: ['/projects/vr-physics-1.jpg'],
      technologies: ['Unity', 'C#', 'VR SDK', 'Physics Engine']
    },
    {
      id: '5',
      title: 'Biodegradable Plastic Alternative',
      description: 'Development of a biodegradable plastic alternative using agricultural waste and natural polymers.',
      category: 'science',
      difficulty_level: 'intermediate',
      author: {
        name: 'Emily Wang',
        role: 'High School Student',
        avatar_url: '/avatars/emily.jpg'
      },
      created_at: '2024-01-18',
      views: 1123,
      likes: 98,
      comments: 28,
      tags: ['Biodegradable', 'Plastic Alternative', 'Sustainability', 'Chemistry'],
      project_url: 'https://project-demo.com/bio-plastic',
      github_url: 'https://github.com/emilyw/bio-plastic',
      images: ['/projects/bio-plastic-1.jpg', '/projects/bio-plastic-2.jpg'],
      technologies: ['Chemical Synthesis', 'Material Testing', 'Lab Equipment']
    },
    {
      id: '6',
      title: 'Autonomous Robot Navigation',
      description: 'A robot that can navigate autonomously using computer vision and machine learning algorithms.',
      category: 'robotics',
      difficulty_level: 'advanced',
      author: {
        name: 'James Wilson',
        role: 'College Student',
        avatar_url: '/avatars/james.jpg'
      },
      created_at: '2024-01-22',
      views: 678,
      likes: 45,
      comments: 18,
      tags: ['Robotics', 'Computer Vision', 'Machine Learning', 'Navigation'],
      project_url: 'https://project-demo.com/robot-nav',
      github_url: 'https://github.com/jamesw/robot-navigation',
      images: ['/projects/robot-1.jpg'],
      technologies: ['Python', 'OpenCV', 'ROS', 'TensorFlow']
    }
  ]

  useEffect(() => {
    checkAuth()
    setProjects(mockProjects)
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
    { id: 'all', name: 'All Categories', icon: FolderOpen },
    { id: 'engineering', name: 'Engineering', icon: Zap },
    { id: 'data-science', name: 'Data Science', icon: Calculator },
    { id: 'environmental', name: 'Environmental', icon: Globe },
    { id: 'technology', name: 'Technology', icon: Code },
    { id: 'science', name: 'Science', icon: Beaker },
    { id: 'robotics', name: 'Robotics', icon: BookOpen }
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty_level === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : FolderOpen
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleLike = (projectId: string) => {
    if (!user) {
      alert('Please log in to like projects')
      return
    }
    
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, likes: project.likes + 1 }
        : project
    ))
  }

  const handleViewProject = (project: Project) => {
    if (project.project_url) {
      window.open(project.project_url, '_blank')
    } else {
      alert('Project demo not available')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading projects...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Project Showcase</h1>
              <p className="mt-2 text-gray-600">Discover amazing STEM projects created by students</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <FolderOpen className="w-4 h-4 mr-2" />
                Submit Project
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
                placeholder="Search projects..."
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
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty.id} value={difficulty.id}>
                    {difficulty.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const CategoryIcon = getCategoryIcon(project.category)
              
              return (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <Badge className={getDifficultyColor(project.difficulty_level)}>
                          {project.difficulty_level}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{project.views}</span>
                        </div>
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{project.likes}</span>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {project.author.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{project.author.name}</p>
                          <p className="text-xs text-gray-500">{project.author.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(project.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          <span>{project.comments} comments</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Technologies:</h4>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1" 
                          variant="outline"
                          onClick={() => handleLike(project.id)}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Like
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => handleViewProject(project)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find available projects.</p>
          </div>
        )}
      </main>
    </div>
  )
} 