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
    default: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    outline: "border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500",
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
            <PlayCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Video Demo Coming Soon!</h3>
            <p className="text-gray-700 mb-6">
              Thank you for your interest. A demo video will be available here shortly.
            </p>
            <Button onClick={onClose} className="bg-purple-600 text-white">
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Logo width={200} height={80} variant="nav" priority />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/videos" className="text-gray-700 hover:text-purple-600 transition-colors">
                Videos
              </Link>
              <Link href="/internships" className="text-gray-700 hover:text-purple-600 transition-colors">
                Internships
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-purple-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
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
              className="md:hidden text-purple-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white shadow-lg rounded-b-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/videos" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-md">
                  Videos
                </Link>
                <Link href="/internships" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-md">
                  Internships
                </Link>
                <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-md">
                  About
                </Link>
                <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-md">
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
      <section className="pt-32 pb-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Future <span className="text-purple-600">Innovators</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our community of learners and innovators. Access expert-led courses, real-world internships, and cutting-edge resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign up">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => setIsVideoModalOpen(true)}
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Novakinetix Spark Academy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a comprehensive learning platform designed to help you succeed in the digital age.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-purple-600 mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-purple-600 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Join thousands of students who are already learning and growing with Novakinetix Spark Academy.
            </p>
            <Link href="/sign up">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </div>
  )
}
