"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import AuthGuard from "@/components/auth-guard"
import { 
  FolderOpen, 
  Star, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Award,
  Zap,
  Brain,
  Lightbulb,
  Target,
  CheckCircle,
  Play,
  ArrowRight,
  Download,
  ExternalLink,
  Github,
  Video,
  Image,
  FileText,
  ChevronRight,
  ChevronDown,
  Filter,
  Search
} from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
    school: string
  }
  category: string
  tags: string[]
  likes: number
  views: number
  comments: number
  rating: number
  status: 'completed' | 'in-progress' | 'concept'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: string
  updatedAt: string
  images: string[]
  videoUrl?: string
  githubUrl?: string
  demoUrl?: string
  technologies: string[]
  features: string[]
  challenges: string[]
  solutions: string[]
}

interface Comment {
  id: string
  author: {
    name: string
    avatar: string
    role: string
  }
  content: string
  rating: number
  createdAt: string
  helpful: number
}

export default function ProjectShowcasePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  const categories = ["all", "Robotics", "Web Development", "Mobile Apps", "Data Science", "IoT", "AI/ML", "Game Development", "3D Printing", "Electronics"]

  const difficulties = ["all", "beginner", "intermediate", "advanced"]

  const sampleProjects: Project[] = [
    {
      id: "1",
      title: "Smart Home Automation System",
      description: "A comprehensive IoT-based home automation system that controls lighting, temperature, and security using Arduino and Raspberry Pi.",
      author: {
        name: "Alex Chen",
        avatar: "/api/avatar/alex",
        school: "Tech High School"
      },
      category: "IoT",
      tags: ["Arduino", "Raspberry Pi", "IoT", "Home Automation"],
      likes: 127,
      views: 2341,
      comments: 23,
      rating: 4.8,
      status: "completed",
      difficulty: "intermediate",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      images: ["/api/project/1/image1", "/api/project/1/image2"],
      videoUrl: "https://youtube.com/watch?v=example1",
      githubUrl: "https://github.com/alexchen/smart-home",
      demoUrl: "https://demo.smarthome.com",
      technologies: ["Arduino", "Raspberry Pi", "Python", "JavaScript", "MQTT"],
      features: [
        "Voice-controlled lighting system",
        "Temperature and humidity monitoring",
        "Security camera integration",
        "Mobile app control",
        "Energy usage analytics"
      ],
      challenges: [
        "Integrating multiple IoT protocols",
        "Ensuring system reliability",
        "Creating intuitive mobile interface"
      ],
      solutions: [
        "Used MQTT for standardized communication",
        "Implemented fail-safe mechanisms",
        "Conducted user testing for UI/UX"
      ]
    },
    {
      id: "2",
      title: "AI-Powered Study Assistant",
      description: "An intelligent study companion that uses machine learning to create personalized study plans and track learning progress.",
      author: {
        name: "Sarah Johnson",
        avatar: "/api/avatar/sarah",
        school: "Science Academy"
      },
      category: "AI/ML",
      tags: ["Machine Learning", "Python", "Education", "NLP"],
      likes: 89,
      views: 1567,
      comments: 15,
      rating: 4.6,
      status: "completed",
      difficulty: "advanced",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
      images: ["/api/project/2/image1"],
      githubUrl: "https://github.com/sarahj/study-assistant",
      demoUrl: "https://study-assistant.demo.com",
      technologies: ["Python", "TensorFlow", "React", "Node.js", "MongoDB"],
      features: [
        "Personalized study recommendations",
        "Progress tracking and analytics",
        "Natural language question answering",
        "Study schedule optimization",
        "Performance prediction"
      ],
      challenges: [
        "Training accurate ML models",
        "Handling diverse learning styles",
        "Scaling for multiple users"
      ],
      solutions: [
        "Used transfer learning with pre-trained models",
        "Implemented adaptive algorithms",
        "Built microservices architecture"
      ]
    },
    {
      id: "3",
      title: "Solar-Powered Weather Station",
      description: "A self-sustaining weather monitoring station that collects environmental data using solar energy and transmits it wirelessly.",
      author: {
        name: "Michael Rodriguez",
        avatar: "/api/avatar/michael",
        school: "Engineering Prep"
      },
      category: "Electronics",
      tags: ["Solar Power", "Weather", "Arduino", "Sensors"],
      likes: 203,
      views: 3421,
      comments: 31,
      rating: 4.9,
      status: "completed",
      difficulty: "intermediate",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-15",
      images: ["/api/project/3/image1", "/api/project/3/image2", "/api/project/3/image3"],
      videoUrl: "https://youtube.com/watch?v=example3",
      githubUrl: "https://github.com/michaelr/weather-station",
      technologies: ["Arduino", "Solar Panels", "LoRa", "Various Sensors"],
      features: [
        "Real-time weather data collection",
        "Solar power management system",
        "Long-range wireless transmission",
        "Data visualization dashboard",
        "Low-power consumption design"
      ],
      challenges: [
        "Optimizing power consumption",
        "Ensuring reliable data transmission",
        "Weatherproofing the system"
      ],
      solutions: [
        "Implemented sleep modes and power management",
        "Used LoRa for reliable long-range communication",
        "Designed waterproof enclosure with proper ventilation"
      ]
    },
    {
      id: "4",
      title: "Educational Game: Math Quest",
      description: "An interactive 3D game that makes learning mathematics fun and engaging for students of all ages.",
      author: {
        name: "Emily Davis",
        avatar: "/api/avatar/emily",
        school: "Innovation Institute"
      },
      category: "Game Development",
      tags: ["Unity", "C#", "Education", "3D Graphics"],
      likes: 156,
      views: 2890,
      comments: 28,
      rating: 4.7,
      status: "in-progress",
      difficulty: "intermediate",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-22",
      images: ["/api/project/4/image1", "/api/project/4/image2"],
      demoUrl: "https://mathquest.demo.com",
      technologies: ["Unity", "C#", "Blender", "Adobe Photoshop"],
      features: [
        "3D interactive environments",
        "Progressive difficulty levels",
        "Real-time feedback system",
        "Multiplayer support",
        "Teacher dashboard"
      ],
      challenges: [
        "Balancing fun and educational content",
        "Creating engaging 3D environments",
        "Implementing adaptive difficulty"
      ],
      solutions: [
        "Conducted extensive playtesting with students",
        "Used procedural generation for environments",
        "Developed AI-driven difficulty adjustment"
      ]
    }
  ]

  useEffect(() => {
    setProjects(sampleProjects)
  }, [])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || project.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "popular":
        return b.likes - a.likes
      case "rating":
        return b.rating - a.rating
      case "views":
        return b.views - a.views
      default:
        return 0
    }
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'concept': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const likeProject = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, likes: project.likes + 1 } : project
    ))
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
                <Link href="/career-pathway">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Career Pathway
                  </Button>
                </Link>
                <Link href="/mentorship">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Mentorship
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
                  <FolderOpen className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Project
                  <span className="bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent ml-2">
                    Showcase
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Discover amazing STEM projects created by students worldwide. Share your work, get feedback, and inspire others.
                </p>
              </div>
            </div>

            {/* Upload Project Banner */}
            <Card className="backdrop-blur-md bg-gradient-to-r from-green-500/20 to-blue-600/20 border-green-400/30 shadow-2xl rounded-2xl overflow-hidden mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Share Your Project</h3>
                    <p className="text-blue-200">Showcase your STEM project and get feedback from the community</p>
                  </div>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Upload Project
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters and Search */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                    />
                  </div>
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
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                  >
                    <option value="newest" className="text-blue-900 bg-white">Newest</option>
                    <option value="popular" className="text-blue-900 bg-white">Most Popular</option>
                    <option value="rating" className="text-blue-900 bg-white">Highest Rated</option>
                    <option value="views" className="text-blue-900 bg-white">Most Viewed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Projects List */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {sortedProjects.map((project) => (
                    <Card key={project.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                            <FolderOpen className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-xl font-bold text-white">{project.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(project.difficulty)}`}>
                                  {project.difficulty}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                                  {project.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-blue-200 mb-3">{project.description}</p>
                            
                            {/* Author Info */}
                            <div className="flex items-center space-x-4 mb-3 text-sm">
                              <div className="flex items-center text-blue-200">
                                <User className="w-4 h-4 mr-1" />
                                <span>{project.author.name}</span>
                              </div>
                              <div className="flex items-center text-blue-200">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center text-blue-200">
                                <Tag className="w-4 h-4 mr-1" />
                                <span>{project.category}</span>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-blue-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6 text-sm text-blue-200 mb-4">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                <span>{project.views}</span>
                              </div>
                              <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-1" />
                                <span>{project.likes}</span>
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                <span>{project.comments}</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                                <span>{project.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setSelectedProject(project)}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {project.githubUrl && (
                              <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/20"
                                onClick={() => window.open(project.githubUrl, '_blank')}
                              >
                                <Github className="w-4 h-4 mr-2" />
                                Code
                              </Button>
                            )}
                            {project.demoUrl && (
                              <Button
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/20"
                                onClick={() => window.open(project.demoUrl, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Demo
                              </Button>
                            )}
                          </div>
                          <Button
                            onClick={() => likeProject(project.id)}
                            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Like
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Project Stats */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Showcase Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Total Projects</span>
                      <span className="text-white font-bold">{projects.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Total Views</span>
                      <span className="text-white font-bold">{projects.reduce((sum, p) => sum + p.views, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Total Likes</span>
                      <span className="text-white font-bold">{projects.reduce((sum, p) => sum + p.likes, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Active Contributors</span>
                      <span className="text-white font-bold">1,247</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Top Categories */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Popular Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {["Web Development", "Robotics", "AI/ML", "Game Development", "IoT"].map((category, index) => (
                      <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <span className="text-blue-200">{category}</span>
                        <span className="text-white font-bold">{Math.floor(Math.random() * 100) + 50}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Featured Project */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Featured Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-white">AI-Powered Study Assistant</h4>
                      <p className="text-sm text-blue-200">An intelligent study companion using machine learning for personalized learning plans.</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-200">by Sarah Johnson</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-white">4.8</span>
                        </div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        View Project
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Project Details Modal */}
            {selectedProject && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white">{selectedProject.title}</CardTitle>
                      <Button
                        onClick={() => setSelectedProject(null)}
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
                        <h4 className="text-lg font-semibold text-white mb-2">Project Overview</h4>
                        <p className="text-blue-200 mb-4">{selectedProject.description}</p>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedProject.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-sm text-green-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Key Features</h4>
                        <ul className="space-y-1">
                          {selectedProject.features.map((feature, index) => (
                            <li key={index} className="text-blue-200 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Project Details</h4>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Author</span>
                            <span className="text-white font-bold">{selectedProject.author.name}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Category</span>
                            <span className="text-white font-bold">{selectedProject.category}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Difficulty</span>
                            <span className="text-white font-bold capitalize">{selectedProject.difficulty}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                            <span className="text-blue-200">Status</span>
                            <span className="text-white font-bold capitalize">{selectedProject.status}</span>
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Challenges & Solutions</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-1">Challenges:</h5>
                            <ul className="space-y-1">
                              {selectedProject.challenges.map((challenge, index) => (
                                <li key={index} className="text-blue-200 text-sm">• {challenge}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-1">Solutions:</h5>
                            <ul className="space-y-1">
                              {selectedProject.solutions.map((solution, index) => (
                                <li key={index} className="text-green-200 text-sm">• {solution}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      {selectedProject.githubUrl && (
                        <Button
                          onClick={() => window.open(selectedProject.githubUrl, '_blank')}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          View Code
                        </Button>
                      )}
                      {selectedProject.demoUrl && (
                        <Button
                          onClick={() => window.open(selectedProject.demoUrl, '_blank')}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </Button>
                      )}
                      {selectedProject.videoUrl && (
                        <Button
                          onClick={() => window.open(selectedProject.videoUrl, '_blank')}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Watch Video
                        </Button>
                      )}
                      <Button
                        onClick={() => setSelectedProject(null)}
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

            {/* Upload Project Modal */}
            {showUploadModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-2xl w-full">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <CardTitle className="text-xl font-bold text-white">Upload Your Project</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <Label htmlFor="title" className="text-white">Project Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter your project title"
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project..."
                        rows={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category" className="text-white">Category</Label>
                        <select
                          id="category"
                          className="w-full bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-lg px-3 py-2"
                        >
                          <option value="" className="text-blue-900 bg-white">Select category</option>
                          {categories.slice(1).map(category => (
                            <option key={category} value={category} className="text-blue-900 bg-white">{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                        <select
                          id="difficulty"
                          className="w-full bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-lg px-3 py-2"
                        >
                          <option value="" className="text-blue-900 bg-white">Select difficulty</option>
                          {difficulties.slice(1).map(difficulty => (
                            <option key={difficulty} value={difficulty} className="text-blue-900 bg-white capitalize">{difficulty}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="tags" className="text-white">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., Python, Arduino, IoT"
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setShowUploadModal(false)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                      >
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Upload Project
                      </Button>
                      <Button
                        onClick={() => setShowUploadModal(false)}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Features Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-white text-center mb-8">
                Why Share Your Projects?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Build Your Portfolio</h3>
                    <p className="text-blue-200">Showcase your skills and creativity to potential employers and collaborators</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Get Feedback</h3>
                    <p className="text-blue-200">Receive valuable feedback and suggestions from the STEM community</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Inspire Others</h3>
                    <p className="text-blue-200">Share your knowledge and inspire fellow students to create amazing projects</p>
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