"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  Building2, 
  GraduationCap,
  Zap,
  Brain,
  Lightbulb,
  CheckCircle,
  Play,
  ArrowRight,
  Briefcase,
  Award,
  Globe,
  DollarSign,
  BarChart3,
  ChevronRight,
  ChevronDown
} from "lucide-react"
import Link from "next/link"

interface CareerPath {
  id: string
  title: string
  description: string
  category: string
  salary: {
    entry: string
    mid: string
    senior: string
  }
  growth: number
  demand: 'high' | 'medium' | 'low'
  skills: string[]
  education: string[]
  companies: string[]
  icon: React.ReactNode
  roadmap: CareerStep[]
}

interface CareerStep {
  id: string
  title: string
  description: string
  duration: string
  skills: string[]
  resources: string[]
  completed: boolean
}

interface SkillAssessment {
  id: string
  name: string
  category: string
  currentLevel: number
  targetLevel: number
  importance: 'high' | 'medium' | 'low'
}

export default function CareerPathwayPage() {
  const [selectedCareer, setSelectedCareer] = useState<CareerPath | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAssessment, setShowAssessment] = useState(false)
  const [userSkills, setUserSkills] = useState<SkillAssessment[]>([])

  const careerPaths: CareerPath[] = [
    {
      id: "software-engineer",
      title: "Software Engineer",
      description: "Design, develop, and maintain software applications and systems",
      category: "Technology",
      salary: {
        entry: "$70,000",
        mid: "$120,000",
        senior: "$180,000"
      },
      growth: 22,
      demand: "high",
      skills: ["Programming", "Problem Solving", "System Design", "Database Management"],
      education: ["Computer Science Degree", "Bootcamp", "Self-taught"],
      companies: ["Google", "Microsoft", "Apple", "Amazon", "Meta"],
      icon: <Zap className="w-6 h-6" />,
      roadmap: [
        {
          id: "step1",
          title: "Learn Programming Fundamentals",
          description: "Master core programming concepts and languages",
          duration: "6-12 months",
          skills: ["Python", "JavaScript", "Data Structures", "Algorithms"],
          resources: ["Codecademy", "LeetCode", "Harvard CS50"],
          completed: false
        },
        {
          id: "step2",
          title: "Build Projects",
          description: "Create portfolio projects to demonstrate skills",
          duration: "3-6 months",
          skills: ["Web Development", "Git", "APIs", "Databases"],
          resources: ["GitHub", "Portfolio Website", "Open Source"],
          completed: false
        },
        {
          id: "step3",
          title: "Apply for Internships",
          description: "Gain real-world experience through internships",
          duration: "3-6 months",
          skills: ["Team Collaboration", "Code Review", "Agile"],
          resources: ["LinkedIn", "Indeed", "Company Career Pages"],
          completed: false
        }
      ]
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      description: "Analyze complex data to help organizations make informed decisions",
      category: "Analytics",
      salary: {
        entry: "$85,000",
        mid: "$130,000",
        senior: "$200,000"
      },
      growth: 36,
      demand: "high",
      skills: ["Statistics", "Machine Learning", "Python", "Data Visualization"],
      education: ["Statistics Degree", "Data Science Bootcamp", "Online Courses"],
      companies: ["Netflix", "Uber", "Airbnb", "Spotify", "Tesla"],
      icon: <Brain className="w-6 h-6" />,
      roadmap: [
        {
          id: "step1",
          title: "Learn Statistics and Mathematics",
          description: "Build strong foundation in statistical concepts",
          duration: "6-12 months",
          skills: ["Statistics", "Linear Algebra", "Calculus", "Probability"],
          resources: ["Khan Academy", "Coursera", "MIT OpenCourseWare"],
          completed: false
        },
        {
          id: "step2",
          title: "Master Data Analysis Tools",
          description: "Learn Python, R, and data visualization tools",
          duration: "6-12 months",
          skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Tableau"],
          resources: ["DataCamp", "Kaggle", "Real Python"],
          completed: false
        },
        {
          id: "step3",
          title: "Build ML Models",
          description: "Develop and deploy machine learning models",
          duration: "6-12 months",
          skills: ["Scikit-learn", "TensorFlow", "Deep Learning", "MLOps"],
          resources: ["Fast.ai", "Andrew Ng Courses", "Hugging Face"],
          completed: false
        }
      ]
    },
    {
      id: "robotics-engineer",
      title: "Robotics Engineer",
      description: "Design and build robots for various applications",
      category: "Engineering",
      salary: {
        entry: "$75,000",
        mid: "$110,000",
        senior: "$160,000"
      },
      growth: 9,
      demand: "medium",
      skills: ["Mechanical Engineering", "Programming", "Control Systems", "Electronics"],
      education: ["Mechanical Engineering Degree", "Robotics Specialization"],
      companies: ["Boston Dynamics", "Tesla", "NASA", "ABB", "Fanuc"],
      icon: <Target className="w-6 h-6" />,
      roadmap: [
        {
          id: "step1",
          title: "Learn Mechanical Engineering",
          description: "Understand mechanical design and manufacturing",
          duration: "12-18 months",
          skills: ["CAD", "Mechanics", "Materials", "Manufacturing"],
          resources: ["SolidWorks", "Fusion 360", "MIT OpenCourseWare"],
          completed: false
        },
        {
          id: "step2",
          title: "Study Control Systems",
          description: "Learn automation and control theory",
          duration: "6-12 months",
          skills: ["Control Theory", "PID", "Automation", "PLC"],
          resources: ["Control Tutorials", "Arduino", "Raspberry Pi"],
          completed: false
        },
        {
          id: "step3",
          title: "Build Robot Projects",
          description: "Create functional robots and automation systems",
          duration: "6-12 months",
          skills: ["ROS", "Computer Vision", "Path Planning", "Integration"],
          resources: ["ROS Tutorials", "OpenCV", "Gazebo Simulator"],
          completed: false
        }
      ]
    },
    {
      id: "biomedical-engineer",
      title: "Biomedical Engineer",
      description: "Develop medical devices and healthcare technologies",
      category: "Healthcare",
      salary: {
        entry: "$65,000",
        mid: "$95,000",
        senior: "$140,000"
      },
      growth: 7,
      demand: "medium",
      skills: ["Biology", "Engineering", "Medical Devices", "Regulations"],
      education: ["Biomedical Engineering Degree", "Medical Device Certification"],
      companies: ["Medtronic", "Johnson & Johnson", "GE Healthcare", "Philips"],
      icon: <Lightbulb className="w-6 h-6" />,
      roadmap: [
        {
          id: "step1",
          title: "Study Biology and Physiology",
          description: "Understand human anatomy and medical principles",
          duration: "12-18 months",
          skills: ["Anatomy", "Physiology", "Biochemistry", "Medical Terminology"],
          resources: ["Khan Academy Medicine", "Anatomy Atlas", "Medical Textbooks"],
          completed: false
        },
        {
          id: "step2",
          title: "Learn Medical Device Design",
          description: "Design safe and effective medical devices",
          duration: "12-18 months",
          skills: ["Medical Device Design", "FDA Regulations", "Safety Standards"],
          resources: ["FDA Guidelines", "ISO Standards", "Medical Device Courses"],
          completed: false
        },
        {
          id: "step3",
          title: "Gain Clinical Experience",
          description: "Work with healthcare professionals and patients",
          duration: "6-12 months",
          skills: ["Clinical Trials", "Patient Safety", "Healthcare Systems"],
          resources: ["Hospital Internships", "Clinical Research", "Medical Conferences"],
          completed: false
        }
      ]
    }
  ]

  const categories = ["all", "Technology", "Analytics", "Engineering", "Healthcare"]

  const filteredCareers = careerPaths.filter(career => {
    const matchesSearch = career.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || career.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-400" />
      case 'low': return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
      default: return <BarChart3 className="w-4 h-4 text-gray-400" />
    }
  }

  const startSkillAssessment = () => {
    setShowAssessment(true)
    // Initialize skill assessment
    setUserSkills([
      { id: "1", name: "Programming", category: "Technical", currentLevel: 3, targetLevel: 8, importance: "high" },
      { id: "2", name: "Mathematics", category: "Analytical", currentLevel: 5, targetLevel: 7, importance: "high" },
      { id: "3", name: "Problem Solving", category: "Cognitive", currentLevel: 6, targetLevel: 9, importance: "high" },
      { id: "4", name: "Communication", category: "Soft Skills", currentLevel: 7, targetLevel: 8, importance: "medium" }
    ])
  }

  return (
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
              <Link href="/mentorship">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Mentorship
                </Button>
              </Link>
              <Link href="/competitions">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Competitions
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Career
                <span className="bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent ml-2">
                  Pathway
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Discover your ideal STEM career path with personalized guidance, skill assessments, and step-by-step roadmaps.
              </p>
            </div>
          </div>

          {/* Skill Assessment Banner */}
          <Card className="backdrop-blur-md bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-indigo-400/30 shadow-2xl rounded-2xl overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Discover Your Perfect Career Match</h3>
                  <p className="text-blue-200">Take our skill assessment to get personalized career recommendations</p>
                </div>
                <Button
                  onClick={startSkillAssessment}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search career paths..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
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
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Career Paths List */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredCareers.map((career) => (
                  <Card key={career.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                          {career.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white">{career.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs text-white bg-green-500/20 border border-green-400/30`}>
                                {career.growth}% growth
                              </span>
                              <div className="flex items-center">
                                {getDemandIcon(career.demand)}
                                <span className={`text-xs ml-1 ${getDemandColor(career.demand)}`}>
                                  {career.demand} demand
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-blue-200 mb-3">{career.description}</p>
                          
                          {/* Salary Range */}
                          <div className="flex items-center space-x-4 mb-3 text-sm">
                            <div className="flex items-center text-green-300">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>Entry: {career.salary.entry}</span>
                            </div>
                            <div className="flex items-center text-blue-300">
                              <DollarSign className="w-4 h-4 mr-1" />
                              <span>Senior: {career.salary.senior}</span>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {career.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-blue-200"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>

                          {/* Top Companies */}
                          <div className="flex items-center text-sm text-blue-200 mb-3">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>Top companies: {career.companies.slice(0, 3).join(", ")}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => setSelectedCareer(career)}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/20"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Roadmap
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Get Started
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Career Stats */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white">Career Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">High Demand Careers</span>
                    <span className="text-white font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Average Salary</span>
                    <span className="text-white font-bold">$95,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Growth Rate</span>
                    <span className="text-white font-bold">18.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Remote Opportunities</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white">Career Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Build a Portfolio</h4>
                      <p className="text-sm text-blue-200">Showcase your projects and skills</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Network Actively</h4>
                      <p className="text-sm text-blue-200">Connect with professionals in your field</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-white">Stay Updated</h4>
                      <p className="text-sm text-blue-200">Keep learning new technologies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Career Roadmap Modal */}
          {selectedCareer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white">{selectedCareer.title} Career Roadmap</CardTitle>
                    <Button
                      onClick={() => setSelectedCareer(null)}
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
                      <h4 className="text-lg font-semibold text-white mb-2">Career Overview</h4>
                      <p className="text-blue-200 mb-4">{selectedCareer.description}</p>
                      
                      <h4 className="text-lg font-semibold text-white mb-2">Required Skills</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedCareer.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-sm text-indigo-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-2">Education Paths</h4>
                      <ul className="space-y-1">
                        {selectedCareer.education.map((edu, index) => (
                          <li key={index} className="text-blue-200 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Salary Progression</h4>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                          <span className="text-blue-200">Entry Level</span>
                          <span className="text-green-300 font-bold">{selectedCareer.salary.entry}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                          <span className="text-blue-200">Mid Career</span>
                          <span className="text-blue-300 font-bold">{selectedCareer.salary.mid}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                          <span className="text-blue-200">Senior Level</span>
                          <span className="text-purple-300 font-bold">{selectedCareer.salary.senior}</span>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-2">Top Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCareer.companies.map((company) => (
                          <span
                            key={company}
                            className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-blue-200"
                          >
                            {company}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Step-by-Step Roadmap</h4>
                    <div className="space-y-4">
                      {selectedCareer.roadmap.map((step, index) => (
                        <div key={step.id} className="border border-white/20 rounded-lg p-4 bg-white/5">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h5 className="text-lg font-semibold text-white mb-2">{step.title}</h5>
                              <p className="text-blue-200 mb-3">{step.description}</p>
                              <div className="flex items-center text-sm text-blue-300 mb-3">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{step.duration}</span>
                              </div>
                              
                              <div className="mb-3">
                                <h6 className="text-sm font-semibold text-white mb-2">Skills to Learn:</h6>
                                <div className="flex flex-wrap gap-2">
                                  {step.skills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded text-xs text-indigo-200"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h6 className="text-sm font-semibold text-white mb-2">Resources:</h6>
                                <div className="flex flex-wrap gap-2">
                                  {step.resources.map((resource) => (
                                    <span
                                      key={resource}
                                      className="px-2 py-1 bg-green-500/20 border border-green-400/30 rounded text-xs text-green-200"
                                    >
                                      {resource}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowAssessment(true)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Assess My Skills
                    </Button>
                    <Button
                      onClick={() => setSelectedCareer(null)}
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

          {/* Skill Assessment Modal */}
          {showAssessment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-2xl w-full">
                <CardHeader className="pb-4 border-b border-white/20">
                  <CardTitle className="text-xl font-bold text-white">Skill Assessment</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <p className="text-blue-200">Rate your current skill levels to get personalized career recommendations.</p>
                  
                  <div className="space-y-4">
                    {userSkills.map((skill) => (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label className="text-white font-medium">{skill.name}</Label>
                          <span className="text-blue-200 text-sm">Level {skill.currentLevel}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={skill.currentLevel}
                          onChange={(e) => {
                            setUserSkills(prev => prev.map(s => 
                              s.id === skill.id ? { ...s, currentLevel: parseInt(e.target.value) } : s
                            ))
                          }}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-blue-300">
                          <span>Beginner</span>
                          <span>Expert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowAssessment(false)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Get Recommendations
                    </Button>
                    <Button
                      onClick={() => setShowAssessment(false)}
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
              Why Choose Our Career Pathway?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Personalized Guidance</h3>
                  <p className="text-blue-200">Get career recommendations based on your skills and interests</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Market Insights</h3>
                  <p className="text-blue-200">Access real-time data on job growth, salaries, and demand</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Step-by-Step Roadmaps</h3>
                  <p className="text-blue-200">Follow detailed learning paths to achieve your career goals</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 