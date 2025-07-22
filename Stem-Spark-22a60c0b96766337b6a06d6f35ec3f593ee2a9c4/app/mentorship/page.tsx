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
  Users, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Star, 
  MapPin, 
  BookOpen, 
  Zap,
  Brain,
  Lightbulb,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Send,
  Video,
  Phone,
  Mail,
  Linkedin,
  Github
} from "lucide-react"
import Link from "next/link"

interface Mentor {
  id: string
  name: string
  title: string
  company: string
  expertise: string[]
  experience: number
  rating: number
  hourlyRate: number
  availability: string[]
  bio: string
  avatar: string
  languages: string[]
  education: string
  certifications: string[]
  specialties: string[]
  contactInfo: {
    email: string
    linkedin: string
    github: string
  }
}

interface Session {
  id: string
  mentorId: string
  studentId: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
  topic: string
  notes: string
}

export default function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExpertise, setSelectedExpertise] = useState("all")
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: 60,
    topic: "",
    notes: ""
  })

  const mentors: Mentor[] = [
    {
      id: "mentor-1",
      name: "Dr. Sarah Chen",
      title: "Senior Software Engineer",
      company: "Google",
      expertise: ["Machine Learning", "Python", "Data Science"],
      experience: 8,
      rating: 4.9,
      hourlyRate: 150,
      availability: ["Monday", "Wednesday", "Friday"],
      bio: "Experienced software engineer with expertise in machine learning and data science. Passionate about mentoring students and helping them develop practical skills.",
      avatar: "/api/avatar/mentor1",
      languages: ["English", "Mandarin"],
      education: "PhD Computer Science, Stanford University",
      certifications: ["AWS Certified Solutions Architect", "Google Cloud Professional"],
      specialties: ["Machine Learning", "Deep Learning", "Computer Vision"],
      contactInfo: {
        email: "sarah.chen@example.com",
        linkedin: "linkedin.com/in/sarahchen",
        github: "github.com/sarahchen"
      }
    },
    {
      id: "mentor-2",
      name: "Alex Rodriguez",
      title: "Robotics Engineer",
      company: "NASA",
      expertise: ["Robotics", "Control Systems", "Python"],
      experience: 12,
      rating: 4.8,
      hourlyRate: 200,
      availability: ["Tuesday", "Thursday", "Saturday"],
      bio: "Robotics engineer with over 12 years of experience in space robotics and autonomous systems. Dedicated to inspiring the next generation of engineers.",
      avatar: "/api/avatar/mentor2",
      languages: ["English", "Spanish"],
      education: "MS Robotics, MIT",
      certifications: ["ROS Certified Developer", "Space Systems Engineering"],
      specialties: ["Space Robotics", "Autonomous Systems", "Control Theory"],
      contactInfo: {
        email: "alex.rodriguez@example.com",
        linkedin: "linkedin.com/in/alexrodriguez",
        github: "github.com/alexrodriguez"
      }
    },
    {
      id: "mentor-3",
      name: "Dr. Emily Watson",
      title: "Research Scientist",
      company: "Microsoft Research",
      expertise: ["Artificial Intelligence", "Neural Networks", "Research"],
      experience: 6,
      rating: 4.7,
      hourlyRate: 180,
      availability: ["Monday", "Tuesday", "Friday"],
      bio: "AI researcher focused on neural networks and deep learning. Published multiple papers in top-tier conferences and passionate about education.",
      avatar: "/api/avatar/mentor3",
      languages: ["English"],
      education: "PhD Artificial Intelligence, Carnegie Mellon University",
      certifications: ["Deep Learning Specialization", "TensorFlow Developer"],
      specialties: ["Neural Networks", "Natural Language Processing", "Computer Vision"],
      contactInfo: {
        email: "emily.watson@example.com",
        linkedin: "linkedin.com/in/emilywatson",
        github: "github.com/emilywatson"
      }
    },
    {
      id: "mentor-4",
      name: "Michael Kim",
      title: "Product Manager",
      company: "Apple",
      expertise: ["Product Management", "User Experience", "Strategy"],
      experience: 10,
      rating: 4.6,
      hourlyRate: 120,
      availability: ["Wednesday", "Thursday", "Sunday"],
      bio: "Product manager with experience in consumer electronics and software. Expert in user experience design and product strategy.",
      avatar: "/api/avatar/mentor4",
      languages: ["English", "Korean"],
      education: "MBA, Harvard Business School",
      certifications: ["Certified Scrum Master", "Google Analytics"],
      specialties: ["Product Strategy", "UX Design", "Market Analysis"],
      contactInfo: {
        email: "michael.kim@example.com",
        linkedin: "linkedin.com/in/michaelkim",
        github: "github.com/michaelkim"
      }
    }
  ]

  const expertiseOptions = ["all", "Machine Learning", "Robotics", "Artificial Intelligence", "Product Management", "Data Science", "Software Engineering"]

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesExpertise = selectedExpertise === "all" || mentor.expertise.includes(selectedExpertise)
    return matchesSearch && matchesExpertise
  })

  const handleBooking = () => {
    // Handle booking logic
    console.log("Booking session:", bookingData)
    setShowBookingModal(false)
    setBookingData({ date: "", time: "", duration: 60, topic: "", notes: "" })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
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
                <Link href="/competitions">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Competitions
                  </Button>
                </Link>
                <Link href="/virtual-lab">
                  <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                    Virtual Lab
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Expert
                  <span className="bg-gradient-to-r from-purple-300 to-pink-400 bg-clip-text text-transparent ml-2">
                    Mentorship
                  </span>
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  Connect with industry professionals and academic experts for personalized guidance in your STEM journey.
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search mentors by name, company, or expertise..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                  />
                </div>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                >
                  {expertiseOptions.map(expertise => (
                    <option key={expertise} value={expertise} className="text-blue-900 bg-white">
                      {expertise === "all" ? "All Expertise" : expertise}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Mentors List */}
              <div className="lg:col-span-2">
                <div className="space-y-6">
                  {filteredMentors.map((mentor) => (
                    <Card key={mentor.id} className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {mentor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                                <p className="text-blue-200">{mentor.title} at {mentor.company}</p>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center mb-1">
                                  {renderStars(mentor.rating)}
                                  <span className="text-blue-200 ml-2">({mentor.rating})</span>
                                </div>
                                <p className="text-yellow-400 font-bold">${mentor.hourlyRate}/hr</p>
                              </div>
                            </div>
                            <p className="text-blue-200 text-sm mb-3">{mentor.bio}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {mentor.expertise.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-blue-200"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-blue-200">
                              <span>{mentor.experience} years experience</span>
                              <span>Available: {mentor.availability.join(', ')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setSelectedMentor(mentor)}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              View Profile
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedMentor(mentor)
                                setShowBookingModal(true)
                              }}
                              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Session
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-white/20"
                            >
                              <Video className="w-4 h-4" />
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
                {/* Quick Stats */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">Mentorship Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Active Mentors</span>
                      <span className="text-white font-bold">{mentors.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Total Sessions</span>
                      <span className="text-white font-bold">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Average Rating</span>
                      <span className="text-white font-bold">4.8/5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200">Success Rate</span>
                      <span className="text-white font-bold">98%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* How It Works */}
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-white">How It Works</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Browse Mentors</h4>
                        <p className="text-sm text-blue-200">Find experts in your field of interest</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Book Session</h4>
                        <p className="text-sm text-blue-200">Schedule a 1-on-1 mentoring session</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">Learn & Grow</h4>
                        <p className="text-sm text-blue-200">Get personalized guidance and feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mentor Profile Modal */}
            {selectedMentor && !showBookingModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-white">{selectedMentor.name}</CardTitle>
                      <Button
                        onClick={() => setSelectedMentor(null)}
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
                        <h4 className="text-lg font-semibold text-white mb-2">About</h4>
                        <p className="text-blue-200 mb-4">{selectedMentor.bio}</p>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Education</h4>
                        <p className="text-blue-200 mb-4">{selectedMentor.education}</p>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Certifications</h4>
                        <ul className="space-y-1">
                          {selectedMentor.certifications.map((cert, index) => (
                            <li key={index} className="text-blue-200 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedMentor.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-sm text-purple-200"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedMentor.languages.map((language) => (
                            <span
                              key={language}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-blue-200"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                        
                        <h4 className="text-lg font-semibold text-white mb-2">Contact</h4>
                        <div className="space-y-2">
                          <div className="flex items-center text-blue-200">
                            <Mail className="w-4 h-4 mr-2" />
                            <a href={`mailto:${selectedMentor.contactInfo.email}`} className="hover:text-white">
                              {selectedMentor.contactInfo.email}
                            </a>
                          </div>
                          <div className="flex items-center text-blue-200">
                            <Linkedin className="w-4 h-4 mr-2" />
                            <a href={`https://${selectedMentor.contactInfo.linkedin}`} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                              LinkedIn Profile
                            </a>
                          </div>
                          <div className="flex items-center text-blue-200">
                            <Github className="w-4 h-4 mr-2" />
                            <a href={`https://${selectedMentor.contactInfo.github}`} className="hover:text-white" target="_blank" rel="noopener noreferrer">
                              GitHub Profile
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={() => setShowBookingModal(true)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button
                        onClick={() => setSelectedMentor(null)}
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

            {/* Booking Modal */}
            {showBookingModal && selectedMentor && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden max-w-md w-full">
                  <CardHeader className="pb-4 border-b border-white/20">
                    <CardTitle className="text-xl font-bold text-white">Book Session with {selectedMentor.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="date" className="text-white">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                        className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time" className="text-white">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                        className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="duration" className="text-white">Duration (minutes)</Label>
                      <select
                        id="duration"
                        value={bookingData.duration}
                        onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                        className="w-full bg-white/10 border border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-lg px-3 py-2"
                      >
                        <option value={30} className="text-blue-900 bg-white">30 minutes</option>
                        <option value={60} className="text-blue-900 bg-white">1 hour</option>
                        <option value={90} className="text-blue-900 bg-white">1.5 hours</option>
                        <option value={120} className="text-blue-900 bg-white">2 hours</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="topic" className="text-white">Topic</Label>
                      <Input
                        id="topic"
                        placeholder="What would you like to discuss?"
                        value={bookingData.topic}
                        onChange={(e) => setBookingData({ ...bookingData, topic: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes" className="text-white">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any specific questions or topics you'd like to cover?"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                        rows={3}
                      />
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Session Cost:</span>
                        <span className="text-white font-bold">
                          ${(selectedMentor.hourlyRate * bookingData.duration / 60).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={handleBooking}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Book Session
                      </Button>
                      <Button
                        onClick={() => setShowBookingModal(false)}
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
                Benefits of Mentorship
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Career Guidance</h3>
                    <p className="text-blue-200">Get personalized advice on career paths, skill development, and industry insights</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Skill Development</h3>
                    <p className="text-blue-200">Learn practical skills and best practices from experienced professionals</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden text-center">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Network Building</h3>
                    <p className="text-blue-200">Connect with industry professionals and expand your professional network</p>
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