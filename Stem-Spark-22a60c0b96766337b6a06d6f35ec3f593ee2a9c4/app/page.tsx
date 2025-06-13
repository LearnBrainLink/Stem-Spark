"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import {
  GraduationCap,
  Users,
  Video,
  Briefcase,
  ArrowRight,
  Play,
  BookOpen,
  Award,
  Rocket,
  Menu,
  X,
  PlayCircle,
} from "lucide-react"
import { Logo } from "../components/logo"

// Simple Button component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  ...props
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  onClick?: () => void
  [key: string]: any
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"

  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
  }

  const sizeClasses = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-sm",
    lg: "px-8 py-3 text-lg",
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

// Simple Card components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
)

const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>

// Simple Badge component
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
    {children}
  </span>
)

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)

  // Modal component for video demo
  const VideoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-lg w-full relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <PlayCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Video Demo Coming Soon!</h3>
            <p className="text-gray-700 mb-6">
              Thank you for your interest. A demo video will be available here shortly.
            </p>
            <Button onClick={onClose} className="bg-blue-600 text-white">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const features = [
    {
      icon: BookOpen,
      title: "Interactive Learning",
      description: "Engage with cutting-edge educational content designed for the next generation of innovators.",
    },
    {
      icon: Video,
      title: "Expert-Led Videos",
      description: "Learn from industry professionals and academic experts through our comprehensive video library.",
    },
    {
      icon: Briefcase,
      title: "Real Internships",
      description: "Apply for hands-on internship opportunities with leading technology companies.",
    },
    {
      icon: Award,
      title: "Certification Programs",
      description: "Earn recognized certifications that validate your skills and knowledge.",
    },
    {
      icon: Users,
      title: "Community Learning",
      description: "Connect with peers, mentors, and industry professionals in our vibrant community.",
    },
    {
      icon: Rocket,
      title: "Innovation Labs",
      description: "Access state-of-the-art facilities and resources to bring your ideas to life.",
    },
  ]

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "500+", label: "Expert Instructors" },
    { number: "1,000+", label: "Video Lessons" },
    { number: "200+", label: "Partner Companies" },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <Link href="/" className="flex items-center">
              <Logo width={250} height={100} variant="nav" priority />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/videos" className="text-gray-700 hover:text-blue-600 transition-colors">
                Videos
              </Link>
              <Link href="/internships" className="text-gray-700 hover:text-blue-600 transition-colors">
                Internships
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign up">
                <Button>Get Started</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-blue-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg rounded-b-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/videos" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">
                  Videos
                </Link>
                <Link href="/internships" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">
                  Internships
                </Link>
                <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">
                  About
                </Link>
                <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md">
                  Contact
                </Link>
                <div className="flex gap-2 px-3 py-2">
                  <Link href="/login" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign up" className="flex-1">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Large prominent logo */}
            <div className="flex justify-center mb-[-32px]">
              <Logo variant="mega" priority />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-2 leading-tight">
              Empowering Future <span className="text-blue-600">Innovators</span>
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-4 max-w-4xl mx-auto font-medium leading-tight">
              Join the next generation of technology leaders through cutting-edge STEM education, hands-on learning
              experiences, and real-world applications.
            </p>

            <div className="flex justify-center my-8">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop"
                alt="Student working on an electronics project with a circuit board"
                className="rounded-lg shadow-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/sign up">
                <Button
                  size="lg"
                  className="bg-blue-600 text-white hover:bg-blue-700 font-semibold px-12 py-6 shadow-xl text-xl"
                >
                  <GraduationCap className="mr-3 w-6 h-6" />
                  Enroll Now
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="text-xl px-12 py-6"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <Play className="mr-3 w-6 h-6" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-600 mb-4">{stat.number}</div>
                <div className="text-lg md:text-xl text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Why Choose NOVAKINETIX ACADEMY?
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto">
              Discover the features that make our platform the premier destination for STEM education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-blue-100 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center mb-6 shadow-md">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">Ready to Shape the Future?</h2>
          <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">
            Join thousands of students who are already building tomorrow's innovations today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/sign up">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-12 py-6 text-xl"
              >
                <GraduationCap className="mr-3 w-6 h-6" />
                Enroll Now
              </Button>
            </Link>
            <Link href="/internships">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-12 py-6 text-xl"
              >
                <Briefcase className="mr-3 w-6 h-6" />
                Explore Internships
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-6 mb-8">
                <Logo variant="large" />
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Empowering the next generation of innovators through cutting-edge STEM education and real-world learning
                experiences.
              </p>
              <div className="flex gap-4">
                <Badge className="bg-blue-600 text-white px-4 py-2">🚀 Innovation</Badge>
                <Badge className="bg-blue-700 text-white px-4 py-2">🎓 Education</Badge>
                <Badge className="bg-blue-400 text-gray-900 px-4 py-2">💡 Excellence</Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-xl">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/videos" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Videos
                </Link>
                <Link href="/internships" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Internships
                </Link>
                <Link href="/about" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  About
                </Link>
                <Link href="/contact" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-6 text-xl">Support</h3>
              <div className="space-y-3">
                <Link href="/help" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Help Center
                </Link>
                <Link href="/privacy" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  Terms of Service
                </Link>
                <Link href="/faq" className="block text-gray-300 hover:text-white transition-colors text-lg">
                  FAQ
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              © 2025 NOVAKINETIX ACADEMY. All rights reserved. Empowering future innovators.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </div>
  )
}
