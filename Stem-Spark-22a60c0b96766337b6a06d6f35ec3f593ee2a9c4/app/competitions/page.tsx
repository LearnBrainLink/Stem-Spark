"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { FloatingElements } from "@/components/FloatingElements"
import { 
  Trophy, 
  Users, 
  Calendar, 
  Target, 
  Award, 
  Star, 
  Clock, 
  MapPin,
  BookOpen,
  Zap,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Play,
  Eye
} from "lucide-react"
import Link from "next/link"

interface Competition {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  startDate: string
  endDate: string
  participants: number
  maxParticipants: number
  prize: string
  status: 'upcoming' | 'active' | 'completed'
  icon: React.ReactNode
  requirements: string[]
  prizes: {
    first: string
    second: string
    third: string
  }
}

interface LeaderboardEntry {
  rank: number
  name: string
  score: number
  avatar: string
  school: string
  submissions: number
}

export default function CompetitionsPage() {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed'>('upcoming')
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const competitions: Competition[] = [
    {
      id: "robotics-2024",
      title: "Robotics Innovation Challenge",
      description: "Design and build an autonomous robot that can solve real-world problems",
      category: "Robotics",
      difficulty: "advanced",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      participants: 45,
      maxParticipants: 100,
      prize: "$5,000",
      status: "active",
      icon: <Zap className="w-6 h-6" />,
      requirements: ["Basic programming knowledge", "Team of 2-4 students", "Access to robotics kit"],
      prizes: {
        first: "$5,000 + Internship Opportunity",
        second: "$2,500 + Mentorship Program",
        third: "$1,000 + Certificate"
      }
    },
    {
      id: "coding-hackathon",
      title: "STEM Coding Hackathon",
      description: "24-hour coding challenge to create innovative STEM education tools",
      category: "Programming",
      difficulty: "intermediate",
      startDate: "2024-02-01",
      endDate: "2024-02-02",
      participants: 78,
      maxParticipants: 150,
      prize: "$3,000",
      status: "upcoming",
      icon: <Brain className="w-6 h-6" />,
      requirements: ["Programming experience", "Laptop", "Creative thinking"],
      prizes: {
        first: "$3,000 + Tech Gadgets",
        second: "$1,500 + Online Course",
        third: "$500 + Swag Pack"
      }
    },
    {
      id: "science-fair",
      title: "Virtual Science Fair",
      description: "Present your scientific research and innovations to a global audience",
      category: "Science",
      difficulty: "beginner",
      startDate: "2024-01-20",
      endDate: "2024-04-20",
      participants: 120,
      maxParticipants: 200,
      prize: "$2,000",
      status: "active",
      icon: <Lightbulb className="w-6 h-6" />,
      requirements: ["Research project", "Presentation skills", "Scientific method"],
      prizes: {
        first: "$2,000 + Publication Opportunity",
        second: "$1,000 + Lab Equipment",
        third: "$500 + Science Kit"
      }
    },
    {
      id: "math-olympiad",
      title: "Mathematics Olympiad",
      description: "Solve challenging mathematical problems and compete with peers worldwide",
      category: "Mathematics",
      difficulty: "advanced",
      startDate: "2024-03-01",
      endDate: "2024-03-15",
      participants: 0,
      maxParticipants: 50,
      prize: "$1,500",
      status: "upcoming",
      icon: <Target className="w-6 h-6" />,
      requirements: ["Advanced math skills", "Problem-solving ability", "Time management"],
      prizes: {
        first: "$1,500 + Math Software License",
        second: "$750 + Advanced Calculator",
        third: "$250 + Math Books"
      }
    },
    {
      id: "engineering-design",
      title: "Engineering Design Challenge",
      description: "Design sustainable solutions for environmental challenges",
      category: "Engineering",
      difficulty: "intermediate",
      startDate: "2024-01-10",
      endDate: "2024-05-10",
      participants: 32,
      maxParticipants: 75,
      prize: "$4,000",
      status: "active",
      icon: <BookOpen className="w-6 h-6" />,
      requirements: ["Engineering concepts", "CAD software", "Sustainability focus"],
      prizes: {
        first: "$4,000 + Patent Filing Support",
        second: "$2,000 + Engineering Tools",
        third: "$1,000 + Workshop Access"
      }
    }
  ]

  const leaderboardData: LeaderboardEntry[] = [
    { rank: 1, name: "Alex Chen", score: 95, avatar: "/api/avatar/1", school: "Tech High School", submissions: 3 },
    { rank: 2, name: "Sarah Johnson", score: 92, avatar: "/api/avatar/2", school: "Science Academy", submissions: 2 },
    { rank: 3, name: "Michael Rodriguez", score: 89, avatar: "/api/avatar/3", school: "Innovation Prep", submissions: 4 },
    { rank: 4, name: "Emily Davis", score: 87, avatar: "/api/avatar/4", school: "STEM Institute", submissions: 2 },
    { rank: 5, name: "David Kim", score: 85, avatar: "/api/avatar/5", school: "Engineering School", submissions: 3 }
  ]

  const categories = ["all", "Robotics", "Programming", "Science", "Mathematics", "Engineering"]

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || comp.category === selectedCategory
    const matchesStatus = comp.status === activeTab
    return matchesSearch && matchesCategory && matchesStatus
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
      case 'upcoming': return 'bg-blue-500'
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const joinCompetition = (competitionId: string) => {
    // Handle joining competition logic
    console.log(`Joining competition: ${competitionId}`)
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
              <Link href="/virtual-lab">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  Virtual Lab
                </Button>
              </Link>
              <Link href="/ai-tutor">
                <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                  AI Tutor
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                STEM
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent ml-2">
                  Competitions
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                Compete with peers worldwide in exciting STEM challenges. Showcase your skills, win prizes, and advance your career.
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search competitions..."
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

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
              {(['upcoming', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-white text-blue-900'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Competitions List */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {filteredCompetitions.map((competition) => (
                  <Card key={competition.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-yellow-400">{competition.icon}</div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{competition.title}</h3>
                            <p className="text-blue-200 text-sm">{competition.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${getDifficultyColor(competition.difficulty)}`}>
                            {competition.difficulty}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(competition.status)}`}>
                            {competition.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-blue-200">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Start: {new Date(competition.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-blue-200">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>End: {new Date(competition.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-sm text-blue-200">
                            <Users className="w-4 h-4 mr-2" />
                            <span>{competition.participants}/{competition.maxParticipants} participants</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-yellow-300">
                            <Trophy className="w-4 h-4 mr-2" />
                            <span>Prize: {competition.prize}</span>
                          </div>
                          <div className="flex items-center text-sm text-blue-200">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{competition.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => setSelectedCompetition(competition)}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {competition.status === 'upcoming' && (
                            <Button
                              onClick={() => joinCompetition(competition.id)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Join Competition
                            </Button>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-blue-200">Progress</div>
                          <div className="w-24 bg-white/20 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                              style={{ width: `${(competition.participants / competition.maxParticipants) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Leaderboard */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {leaderboardData.map((entry) => (
                    <div key={entry.rank} className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-white/10 text-blue-200'
                      }`}>
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{entry.name}</div>
                        <div className="text-xs text-blue-200">{entry.school}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-yellow-400">{entry.score}</div>
                        <div className="text-xs text-blue-200">{entry.submissions} submissions</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Active Competitions</span>
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Total Participants</span>
                    <span className="text-white font-bold">275</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Prizes Awarded</span>
                    <span className="text-white font-bold">$15,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-200">Countries</span>
                    <span className="text-white font-bold">12</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Competition Details Modal */}
          {selectedCompetition && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader className="pb-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-white">{selectedCompetition.title}</CardTitle>
                    <Button
                      onClick={() => setSelectedCompetition(null)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/20"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Description</h4>
                    <p className="text-blue-200">{selectedCompetition.description}</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Requirements</h4>
                    <ul className="space-y-1">
                      {selectedCompetition.requirements.map((req, index) => (
                        <li key={index} className="flex items-center text-blue-200">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Prizes</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                        <span className="text-yellow-300 font-medium">🥇 1st Place</span>
                        <span className="text-white">{selectedCompetition.prizes.first}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-500/10 rounded-lg">
                        <span className="text-gray-300 font-medium">🥈 2nd Place</span>
                        <span className="text-white">{selectedCompetition.prizes.second}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-600/10 rounded-lg">
                        <span className="text-orange-300 font-medium">🥉 3rd Place</span>
                        <span className="text-white">{selectedCompetition.prizes.third}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      onClick={() => joinCompetition(selectedCompetition.id)}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
                    >
                      Join Competition
                    </Button>
                    <Button
                      onClick={() => setSelectedCompetition(null)}
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
              Why Participate in Competitions?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Win Prizes</h3>
                  <p className="text-blue-200">Compete for cash prizes, scholarships, and valuable opportunities</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Build Network</h3>
                  <p className="text-blue-200">Connect with peers, mentors, and industry professionals worldwide</p>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gain Experience</h3>
                  <p className="text-blue-200">Develop real-world skills and build an impressive portfolio</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 