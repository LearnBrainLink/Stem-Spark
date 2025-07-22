"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import AuthGuard from "@/components/auth-guard"
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Award, 
  Target, 
  Zap,
  Brain,
  Lightbulb,
  AlertCircle,
  Users,
  GraduationCap,
  TrendingUp,
  Code2,
  Wifi,
  Cpu,
  BarChart3,
  Smartphone,
  User,
  Building2,
  Trophy,
  Bookmark,
  Share2
} from "lucide-react"
import Link from "next/link"

interface LearningPath {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  moduleCount: number
  rating: number
  enrolledStudents: number
  completionRate: number
  icon: React.ReactNode
  color: string
  isEnrolled: boolean
  progress: number
  modules: Module[]
  prerequisites: string[]
  outcomes: string[]
  instructor: {
    name: string
    avatar: string
    title: string
    company: string
  }
}

interface Module {
  id: string
  title: string
  description: string
  duration: number
  lessonCount: number
  completed: boolean
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'reading' | 'quiz' | 'project' | 'lab'
  duration: number
  completed: boolean
  icon: React.ReactNode
}

export default function LearningPathPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false)

  const categories = ["all", "Programming", "Mathematics", "Science", "Engineering", "Robotics", "AI/ML", "Web Development", "Mobile Development"]

  const difficulties = ["all", "beginner", "intermediate", "advanced"]

  const sampleLearningPaths: LearningPath[] = [
    {
      id: "python-fundamentals",
      title: "Python Programming Fundamentals",
      description: "Master the basics of Python programming with hands-on projects and real-world applications.",
      category: "Programming",
      difficulty: "beginner",
      duration: 40,
      moduleCount: 8,
      rating: 4.8,
      enrolledStudents: 1247,
      completionRate: 78,
      icon: <Code2 className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-600",
      isEnrolled: true,
      progress: 65,
      modules: [
        {
          id: "m1",
          title: "Introduction to Python",
          description: "Learn the basics of Python syntax and programming concepts",
          duration: 5,
          lessonCount: 6,
          completed: true,
          lessons: [
            { id: "l1", title: "What is Python?", type: "video", duration: 15, completed: true, icon: <Play className="w-4 h-4" /> },
            { id: "l2", title: "Setting up your environment", type: "reading", duration: 10, completed: true, icon: <BookOpen className="w-4 h-4" /> },
            { id: "l3", title: "Your first Python program", type: "project", duration: 30, completed: true, icon: <Code2 className="w-4 h-4" /> },
            { id: "l4", title: "Variables and data types", type: "video", duration: 20, completed: true, icon: <Play className="w-4 h-4" /> },
            { id: "l5", title: "Basic operations", type: "reading", duration: 15, completed: true, icon: <BookOpen className="w-4 h-4" /> },
            { id: "l6", title: "Module 1 Quiz", type: "quiz", duration: 20, completed: true, icon: <Target className="w-4 h-4" /> }
          ]
        },
        {
          id: "m2",
          title: "Control Flow and Functions",
          description: "Master conditional statements, loops, and function definitions",
          duration: 6,
          lessonCount: 5,
          completed: false,
          lessons: [
            { id: "l7", title: "If statements and conditionals", type: "video", duration: 25, completed: true, icon: <Play className="w-4 h-4" /> },
            { id: "l8", title: "Loops and iterations", type: "video", duration: 30, completed: true, icon: <Play className="w-4 h-4" /> },
            { id: "l9", title: "Function basics", type: "reading", duration: 20, completed: false, icon: <BookOpen className="w-4 h-4" /> },
            { id: "l10", title: "Building a calculator", type: "project", duration: 45, completed: false, icon: <Code2 className="w-4 h-4" /> },
            { id: "l11", title: "Module 2 Quiz", type: "quiz", duration: 25, completed: false, icon: <Target className="w-4 h-4" /> }
          ]
        }
      ],
      prerequisites: ["Basic computer literacy", "No programming experience required"],
      outcomes: [
        "Write Python programs from scratch",
        "Understand programming fundamentals",
        "Build real-world applications",
        "Prepare for advanced Python topics"
      ],
      instructor: {
        name: "Dr. Sarah Chen",
        avatar: "/api/avatar/sarah",
        title: "Senior Software Engineer",
        company: "Google"
      }
    },
    {
      id: "machine-learning-basics",
      title: "Machine Learning Fundamentals",
      description: "Learn the core concepts of machine learning and build your first ML models.",
      category: "AI/ML",
      difficulty: "intermediate",
      duration: 60,
      moduleCount: 10,
      rating: 4.9,
      enrolledStudents: 892,
      completionRate: 65,
      icon: <Brain className="w-6 h-6" />,
      color: "from-purple-500 to-pink-600",
      isEnrolled: false,
      progress: 0,
      modules: [],
      prerequisites: ["Python programming", "Basic mathematics", "Statistics fundamentals"],
      outcomes: [
        "Understand ML algorithms and concepts",
        "Build and train ML models",
        "Evaluate model performance",
        "Apply ML to real-world problems"
      ],
      instructor: {
        name: "Dr. Michael Rodriguez",
        avatar: "/api/avatar/michael",
        title: "AI Research Scientist",
        company: "Microsoft Research"
      }
    },
    {
      id: "web-development",
      title: "Full-Stack Web Development",
      description: "Build modern web applications using HTML, CSS, JavaScript, and React.",
      category: "Web Development",
      difficulty: "beginner",
      duration: 50,
      moduleCount: 12,
      rating: 4.7,
      enrolledStudents: 2156,
      completionRate: 72,
      icon: <Wifi className="w-6 h-6" />,
      color: "from-green-500 to-blue-600",
      isEnrolled: true,
      progress: 30,
      modules: [],
      prerequisites: ["Basic computer skills", "No prior programming required"],
      outcomes: [
        "Build responsive websites",
        "Create interactive web applications",
        "Deploy websites to the internet",
        "Understand web development best practices"
      ],
      instructor: {
        name: "Alex Johnson",
        avatar: "/api/avatar/alex",
        title: "Full-Stack Developer",
        company: "Netflix"
      }
    },
    {
      id: "robotics-engineering",
      title: "Robotics Engineering",
      description: "Design and build robots using Arduino, sensors, and mechanical systems.",
      category: "Robotics",
      difficulty: "intermediate",
      duration: 45,
      moduleCount: 9,
      rating: 4.6,
      enrolledStudents: 567,
      completionRate: 58,
      icon: <Cpu className="w-6 h-6" />,
      color: "from-orange-500 to-red-600",
      isEnrolled: false,
      progress: 0,
      modules: [],
      prerequisites: ["Basic electronics", "Programming fundamentals", "Mechanical aptitude"],
      outcomes: [
        "Design and build functional robots",
        "Program microcontrollers",
        "Integrate sensors and actuators",
        "Understand robotics principles"
      ],
      instructor: {
        name: "Emily Davis",
        avatar: "/api/avatar/emily",
        title: "Robotics Engineer",
        company: "Boston Dynamics"
      }
    },
    {
      id: "data-science",
      title: "Data Science Essentials",
      description: "Learn data analysis, visualization, and statistical modeling techniques.",
      category: "Science",
      difficulty: "intermediate",
      duration: 55,
      moduleCount: 11,
      rating: 4.8,
      enrolledStudents: 1345,
      completionRate: 69,
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-teal-500 to-cyan-600",
      isEnrolled: false,
      progress: 0,
      modules: [],
      prerequisites: ["Python programming", "Basic statistics", "Mathematics fundamentals"],
      outcomes: [
        "Analyze and visualize data",
        "Build statistical models",
        "Make data-driven decisions",
        "Present findings effectively"
      ],
      instructor: {
        name: "Dr. Lisa Wang",
        avatar: "/api/avatar/lisa",
        title: "Data Scientist",
        company: "Spotify"
      }
    },
    {
      id: "mobile-app-development",
      title: "Mobile App Development",
      description: "Create iOS and Android apps using React Native and modern development tools.",
      category: "Mobile Development",
      difficulty: "intermediate",
      duration: 48,
      moduleCount: 10,
      rating: 4.5,
      enrolledStudents: 789,
      completionRate: 61,
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-indigo-500 to-purple-600",
      isEnrolled: false,
      progress: 0,
      modules: [],
      prerequisites: ["JavaScript programming", "Basic React knowledge", "Mobile app concepts"],
      outcomes: [
        "Build cross-platform mobile apps",
        "Deploy to app stores",
        "Implement mobile UI/UX",
        "Handle mobile-specific features"
      ],
      instructor: {
        name: "David Kim",
        avatar: "/api/avatar/david",
        title: "Mobile Developer",
        company: "Apple"
      }
    }
  ]

  useEffect(() => {
    setLearningPaths(sampleLearningPaths)
  }, [])

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || path.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || path.difficulty === selectedDifficulty
    const matchesEnrollment = !showEnrolledOnly || path.isEnrolled
    return matchesSearch && matchesCategory && matchesDifficulty && matchesEnrollment
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const enrollInPath = (pathId: string) => {
    setLearningPaths(prev => prev.map(path => 
      path.id === pathId ? { ...path, isEnrolled: true } : path
    ))
  }

  const continueLearning = (pathId: string) => {
    const path = learningPaths.find(p => p.id === pathId)
    if (path) {
      setSelectedPath(path)
    }
  }

  return (
    <AuthGuard>
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
                <Link href="/project-showcase">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Project Showcase
                  </Button>
                </Link>
                <Link href="/career-pathway">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Career Pathway
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full mb-4">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Learning
                  <span className="bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent ml-2">
                    Paths
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Follow structured learning journeys designed by industry experts. Track your progress and earn certificates as you master new skills.
                </p>
              </div>
            </div>

            {/* Progress Overview */}
            <Card className="backdrop-blur-md bg-gradient-to-r from-teal-500/20 to-cyan-600/20 border-teal-400/30 shadow-2xl rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">3</div>
                    <div className="text-blue-200 text-sm">Enrolled Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">47%</div>
                    <div className="text-blue-200 text-sm">Average Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">12</div>
                    <div className="text-blue-200 text-sm">Completed Modules</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">2</div>
                    <div className="text-blue-200 text-sm">Certificates Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    placeholder="Search learning paths..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="text-blue-900 bg-white">
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty} className="text-blue-900 bg-white">
                        {difficulty === "all" ? "All Levels" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => setShowEnrolledOnly(!showEnrolledOnly)}
                    variant={showEnrolledOnly ? "default" : "outline"}
                    className={showEnrolledOnly ? "bg-blue-600 text-white" : "border-white/20 text-white hover:bg-white/20"}
                  >
                    My Courses
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Learning Paths List */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {filteredPaths.map((path) => (
                    <Card key={path.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className={`w-16 h-16 bg-gradient-to-r ${path.color} rounded-full flex items-center justify-center text-white`}>
                            {path.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-white">{path.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(path.difficulty)}`}>
                                  {path.difficulty}
                                </span>
                                {path.isEnrolled && (
                                  <span className="px-2 py-1 rounded-full text-xs text-white bg-green-500">
                                    Enrolled
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-blue-200 mb-3">{path.description}</p>
                            
                            {/* Instructor Info */}
                            <div className="flex items-center space-x-4 mb-3 text-sm">
                              <div className="flex items-center text-blue-200">
                                <User className="w-4 h-4 mr-1" />
                                <span>{path.instructor.name}</span>
                              </div>
                              <div className="flex items-center text-blue-200">
                                <Building2 className="w-4 h-4 mr-1" />
                                <span>{path.instructor.company}</span>
                              </div>
                              <div className="flex items-center text-blue-200">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{path.duration} hours</span>
                              </div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-blue-200 mb-4">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>{path.enrolledStudents.toLocaleString()} students</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                <span>{path.rating}</span>
                              </div>
                              <div className="flex items-center">
                                <Trophy className="w-4 h-4 mr-1" />
                                <span>{path.completionRate}% completion</span>
                              </div>
                            </div>

                            {/* Progress Bar for enrolled courses */}
                            {path.isEnrolled && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm text-blue-200 mb-2">
                                  <span>Progress</span>
                                  <span>{path.progress}%</span>
                                </div>
                                <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setSelectedPath(path)}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {path.isEnrolled ? (
                              <Button
                                onClick={() => continueLearning(path.id)}
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Continue Learning
                              </Button>
                            ) : (
                              <Button
                                onClick={() => enrollInPath(path.id)}
                                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                              >
                                <BookOpen className="w-4 h-4 mr-2" />
                                Enroll Now
                              </Button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* My Learning */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">My Learning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {learningPaths.filter(p => p.isEnrolled).map((path) => (
                      <div key={path.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${path.color} rounded-full flex items-center justify-center`}>
                            {path.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{path.title}</h4>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-xs text-blue-200">{path.progress}%</span>
                              <span className="text-xs text-blue-200">{path.duration}h</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1 rounded-full transition-all duration-300" 
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommended Paths */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Recommended for You</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {learningPaths.filter(p => !p.isEnrolled).slice(0, 3).map((path) => (
                      <div key={path.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${path.color} rounded-full flex items-center justify-center`}>
                            {path.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{path.title}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-blue-200">{path.difficulty}</span>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-xs text-blue-200">{path.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Learning Stats */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Learning Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Total Study Time</span>
                      <span className="text-white font-bold">47 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Streak</span>
                      <span className="text-white font-bold">12 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Achievements</span>
                      <span className="text-white font-bold">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Rank</span>
                      <span className="text-white font-bold">#247</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Learning Path Details Modal */}
            {selectedPath && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white">{selectedPath.title}</CardTitle>
                      <Button
                        onClick={() => setSelectedPath(null)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Course Overview</h4>
                        <p className="text-blue-200 mb-4">{selectedPath.description}</p>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">What You'll Learn</h4>
                        <ul className="space-y-1">
                          {selectedPath.outcomes.map((outcome, index) => (
                            <li key={index} className="text-blue-200 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                              {outcome}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Course Details</h4>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Duration</span>
                            <span className="text-white font-bold">{selectedPath.duration} hours</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Modules</span>
                            <span className="text-white font-bold">{selectedPath.modules.length}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Difficulty</span>
                            <span className="text-white font-bold capitalize">{selectedPath.difficulty}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Rating</span>
                            <span className="text-white font-bold">{selectedPath.rating}/5.0</span>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Prerequisites</h4>
                        <ul className="space-y-1">
                          {selectedPath.prerequisites.map((prereq, index) => (
                            <li key={index} className="text-blue-200 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
                              {prereq}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {selectedPath.modules.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Course Modules</h4>
                        <div className="space-y-3">
                          {selectedPath.modules.map((module, index) => (
                            <div key={module.id} className="border border-white/20 rounded-lg p-4 bg-white/5">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h5 className="text-lg font-semibold text-white">{module.title}</h5>
                                    <p className="text-sm text-blue-200">{module.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-blue-200">{module.duration}h</div>
                                  <div className="text-sm text-blue-200">{module.lessons.length} lessons</div>
                                </div>
                              </div>
                              
                              {module.lessons.length > 0 && (
                                <div className="space-y-2">
                                  {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-2 rounded bg-white/5">
                                      <div className="flex items-center space-x-2">
                                        {lesson.completed ? (
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                          <div className="w-4 h-4 border-2 border-blue-400 rounded-full" />
                                        )}
                                        <span className="text-sm text-blue-200">{lesson.title}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {lesson.icon}
                                        <span className="text-xs text-blue-300">{lesson.duration}m</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      {selectedPath.isEnrolled ? (
                        <Button
                          onClick={() => continueLearning(selectedPath.id)}
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button
                          onClick={() => enrollInPath(selectedPath.id)}
                          className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Enroll Now
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedPath(null)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Why Choose Our Learning Paths?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Structured Learning</h3>
                    <p className="text-blue-200">Follow carefully designed curricula that build skills progressively</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Earn Certificates</h3>
                    <p className="text-blue-200">Get recognized for your achievements with industry-recognized certificates</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Track Progress</h3>
                    <p className="text-blue-200">Monitor your learning journey with detailed progress tracking and analytics</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
} 