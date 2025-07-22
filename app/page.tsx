"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/logo'
import { FloatingElements } from '@/components/FloatingElements'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }
    checkAuth()
  }, [supabase.auth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <FloatingElements />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Logo variant="nav" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="/videos"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Videos
              </a>
              <a
                href="/internships"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Internships
              </a>
              <Link
                href="/intern-application"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Apply as Intern
              </Link>
              <a
                href="/communication-hub"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Communication Hub
              </a>
              <Link
                href="/ai-tutor"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                AI Tutor
              </Link>
              <Link
                href="/virtual-lab"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Virtual Lab
              </Link>
              <Link
                href="/competitions"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Competitions
              </Link>
              <Link
                href="/mentorship"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Mentorship
              </Link>
              <Link
                href="/career-pathway"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Career Pathway
              </Link>
              <Link
                href="/project-showcase"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Project Showcase
              </Link>
              <Link
                href="/learning-path"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                Learning Paths
              </Link>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-4 ml-4">
                <Link href="/login">
                  <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium text-sm">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-fade-in">
            <div className="px-4 py-6 space-y-4 max-h-96 overflow-y-auto">
              <a
                href="/videos"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Videos
              </a>
              <a
                href="/internships"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Internships
              </a>
              <Link
                href="/intern-application"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Apply as Intern
              </Link>
              <a
                href="/communication-hub"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Communication Hub
              </a>
              <Link
                href="/ai-tutor"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                AI Tutor
              </Link>
              <Link
                href="/virtual-lab"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Virtual Lab
              </Link>
              <Link
                href="/competitions"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Competitions
              </Link>
              <Link
                href="/mentorship"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Mentorship
              </Link>
              <Link
                href="/career-pathway"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Career Pathway
              </Link>
              <Link
                href="/project-showcase"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Project Showcase
              </Link>
              <Link
                href="/learning-path"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
              >
                Learning Paths
              </Link>
              
              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link href="/login" className="block">
                  <button className="w-full border border-blue-600 text-blue-600 px-6 py-3 rounded-full hover:bg-blue-50 transition-colors font-medium">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/signup"} className="block">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                NovaKinetix Academy
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empowering Future Innovators through cutting-edge STEM education, 
              real-world projects, and personalized learning experiences
            </p>
            
            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Intern Applications</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Join our team as an intern and gain valuable experience while contributing to our mission of advancing STEM education.
                </p>
                <Link 
                  href="/intern-application"
                  className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Apply Now
                </Link>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Our Community</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Register as a student, parent, or teacher to access our comprehensive educational programs and resources.
                </p>
                <Link 
                  href="/signup"
                  className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Communication Hub</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Connect with teachers, parents, and students through our real-time messaging platform and collaborative tools.
                </p>
                <Link 
                  href="/communication-hub"
                  className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                >
                  Join Chat
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 