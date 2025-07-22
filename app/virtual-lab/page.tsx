'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Beaker, 
  Microscope, 
  Calculator,
  Code,
  Zap,
  Play,
  BookOpen,
  Clock,
  Users,
  Star
} from 'lucide-react'

interface Experiment {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  duration_minutes: number
  materials_needed: string[]
  instructions: string
  learning_objectives: string[]
  is_interactive: boolean
  simulation_url?: string
}

export default function VirtualLabPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  // Mock experiments data (in a real app, this would come from the database)
  const mockExperiments: Experiment[] = [
    {
      id: '1',
      title: 'Virtual Chemistry Lab',
      description: 'Explore chemical reactions in a safe virtual environment',
      category: 'chemistry',
      difficulty_level: 'beginner',
      duration_minutes: 45,
      materials_needed: ['Virtual beakers', 'Chemical compounds', 'Safety equipment'],
      instructions: 'Follow the step-by-step instructions to perform chemical reactions',
      learning_objectives: ['Understand chemical reactions', 'Learn lab safety', 'Practice measurement'],
      is_interactive: true,
      simulation_url: '/simulations/chemistry-lab'
    },
    {
      id: '2',
      title: 'Physics Motion Simulator',
      description: 'Experiment with motion, forces, and energy in interactive simulations',
      category: 'physics',
      difficulty_level: 'intermediate',
      duration_minutes: 60,
      materials_needed: ['Virtual objects', 'Force sensors', 'Motion trackers'],
      instructions: 'Manipulate objects to observe motion and forces',
      learning_objectives: ['Understand Newton\'s laws', 'Explore energy conservation', 'Analyze motion graphs'],
      is_interactive: true,
      simulation_url: '/simulations/physics-motion'
    },
    {
      id: '3',
      title: 'Biology Microscope Lab',
      description: 'Examine cells and microorganisms through a virtual microscope',
      category: 'biology',
      difficulty_level: 'beginner',
      duration_minutes: 30,
      materials_needed: ['Virtual microscope', 'Sample slides', 'Magnification tools'],
      instructions: 'Use the virtual microscope to examine different cell types',
      learning_objectives: ['Identify cell structures', 'Compare cell types', 'Learn microscopy techniques'],
      is_interactive: true,
      simulation_url: '/simulations/biology-microscope'
    },
    {
      id: '4',
      title: 'Programming Circuit Simulator',
      description: 'Build and test electronic circuits with virtual components',
      category: 'engineering',
      difficulty_level: 'advanced',
      duration_minutes: 90,
      materials_needed: ['Virtual components', 'Circuit board', 'Testing tools'],
      instructions: 'Design and build circuits using virtual components',
      learning_objectives: ['Understand circuit design', 'Learn component functions', 'Practice troubleshooting'],
      is_interactive: true,
      simulation_url: '/simulations/engineering-circuits'
    },
    {
      id: '5',
      title: 'Mathematics Geometry Explorer',
      description: 'Explore geometric concepts through interactive visualizations',
      category: 'mathematics',
      difficulty_level: 'intermediate',
      duration_minutes: 40,
      materials_needed: ['Virtual shapes', 'Measurement tools', 'Drawing tools'],
      instructions: 'Manipulate geometric shapes to understand properties',
      learning_objectives: ['Explore geometric properties', 'Practice measurements', 'Understand transformations'],
      is_interactive: true,
      simulation_url: '/simulations/math-geometry'
    },
    {
      id: '6',
      title: 'Environmental Science Lab',
      description: 'Study environmental factors and their impact on ecosystems',
      category: 'environmental',
      difficulty_level: 'beginner',
      duration_minutes: 50,
      materials_needed: ['Virtual ecosystem', 'Environmental sensors', 'Data collection tools'],
      instructions: 'Monitor and analyze environmental data in virtual ecosystems',
      learning_objectives: ['Understand ecosystems', 'Learn data collection', 'Analyze environmental factors'],
      is_interactive: true,
      simulation_url: '/simulations/environmental-science'
    }
  ]

  useEffect(() => {
    checkAuth()
    setExperiments(mockExperiments)
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
    { id: 'all', name: 'All Categories', icon: Beaker },
    { id: 'chemistry', name: 'Chemistry', icon: Beaker },
    { id: 'physics', name: 'Physics', icon: Zap },
    { id: 'biology', name: 'Biology', icon: Microscope },
    { id: 'mathematics', name: 'Mathematics', icon: Calculator },
    { id: 'engineering', name: 'Engineering', icon: Code },
    { id: 'environmental', name: 'Environmental', icon: BookOpen }
  ]

  const difficulties = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ]

  const filteredExperiments = experiments.filter(experiment => {
    const matchesCategory = selectedCategory === 'all' || experiment.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || experiment.difficulty_level === selectedDifficulty
    
    return matchesCategory && matchesDifficulty
  })

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category)
    return categoryData ? categoryData.icon : Beaker
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStartExperiment = (experiment: Experiment) => {
    if (experiment.simulation_url) {
      // In a real app, this would navigate to the simulation
      alert(`Starting ${experiment.title} simulation...`)
    } else {
      alert('Simulation not available yet')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading virtual lab...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Virtual Lab</h1>
              <p className="mt-2 text-gray-600">Conduct experiments safely in our virtual laboratory</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button>
                <Beaker className="w-4 h-4 mr-2" />
                My Experiments
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

      {/* Experiments Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredExperiments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => {
              const CategoryIcon = getCategoryIcon(experiment.category)
              
              return (
                <Card key={experiment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CategoryIcon className="w-5 h-5 text-blue-600" />
                        <Badge className={getDifficultyColor(experiment.difficulty_level)}>
                          {experiment.difficulty_level}
                        </Badge>
                      </div>
                      {experiment.is_interactive && (
                        <Badge variant="secondary">Interactive</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{experiment.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {experiment.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{experiment.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Virtual</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Learning Objectives:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {experiment.learning_objectives.slice(0, 2).map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <Star className="w-3 h-3 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                          {experiment.learning_objectives.length > 2 && (
                            <li className="text-xs text-gray-500">
                              +{experiment.learning_objectives.length - 2} more objectives
                            </li>
                          )}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Materials:</h4>
                        <div className="flex flex-wrap gap-1">
                          {experiment.materials_needed.slice(0, 2).map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                          {experiment.materials_needed.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{experiment.materials_needed.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => handleStartExperiment(experiment)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Experiment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No experiments found</h3>
            <p className="text-gray-600">Try adjusting your filters to find available experiments.</p>
          </div>
        )}
      </main>
    </div>
  )
} 