"use client"

import React, { useState, useEffect } from "react"
import { Logo } from "../components/logo"
import { FloatingElements } from "../components/FloatingElements"
import { HeroSection } from "../components/HeroSection"
import { StatsSection } from "../components/StatsSection"
import { InternshipGallery } from "../components/InternshipGallery"
import { FeaturesSection } from "../components/FeaturesSection"
import { CTASection } from "../components/CTASection"
import { VideoModal } from "../components/VideoModal"
import { Menu, X, Lock, Star } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <FloatingElements />
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Logo variant="nav" />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Public Pages */}
              <div className="flex items-center space-x-4 mr-6">
                <a
                  href="/videos"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                  title="Browse educational videos"
                >
                  📹 Videos
                </a>
                <a
                  href="/internships"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                  title="Find internship opportunities"
                >
                  💼 Internships
                </a>
                <Link
                  href="/intern-application"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                  title="Apply to become an intern"
                >
                  📝 Apply as Intern
                </Link>
                <a
                  href="/communication-hub"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                  title="Join community discussions"
                >
                  💬 Communication Hub
                </a>
                <a
                  href="/discussion-board"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                  title="Community discussion board"
                >
                  📋 Discussion Board
                </a>
              </div>

              {/* Protected Pages with Guest Access Indicators */}
              <div className="flex items-center space-x-4 mr-6">
                <div className="relative group">
                  <Link
                    href="/ai-tutor"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="AI-powered tutoring assistance"
                  >
                    <span>🤖 AI Tutor</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Get personalized AI tutoring help</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/virtual-lab"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Interactive virtual laboratory"
                  >
                    <span>🧪 Virtual Lab</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Conduct experiments in virtual labs</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/competitions"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Participate in STEM competitions"
                  >
                    <span>🏆 Competitions</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Join exciting STEM competitions</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/mentorship"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Connect with mentors"
                  >
                    <span>👥 Mentorship</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Get guidance from experienced mentors</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/career-pathway"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Explore career opportunities"
                  >
                    <span>🎯 Career Pathway</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Plan your STEM career journey</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/project-showcase"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Showcase your projects"
                  >
                    <span>📊 Project Showcase</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Display your amazing projects</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <Link
                    href="/learning-path"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all font-medium text-sm"
                    title="Personalized learning paths"
                  >
                    <span>📚 Learning Paths</span>
                    <Lock className="w-3 h-3 text-orange-500" />
                  </Link>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="font-medium">Premium Feature</span>
                      </div>
                      <p>Follow personalized learning tracks</p>
                      <p className="text-orange-600 font-medium mt-1">Requires intern or student account</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium text-sm">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-gray-700 hover:text-blue-600 transition-colors"
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

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-fade-in">
            <div className="px-4 py-6 space-y-4">
              {/* Public Pages */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Public Features</h3>
                <a
                  href="/videos"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  Videos
                </a>
                <a
                  href="/internships"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  Internships
                </a>
                <Link
                  href="/intern-application"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  Apply as Intern
                </Link>
                <a
                  href="/communication-hub"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  Communication Hub
                </a>
              </div>

              {/* Protected Pages */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center space-x-2">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span>Premium Features</span>
                </h3>
                <Link
                  href="/ai-tutor"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>AI Tutor</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/virtual-lab"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Virtual Lab</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/competitions"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Competitions</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/mentorship"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Mentorship</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/career-pathway"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Career Pathway</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/project-showcase"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Project Showcase</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
                <Link
                  href="/learning-path"
                  className="flex items-center justify-between text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
                >
                  <span>Learning Paths</span>
                  <Lock className="w-3 h-3 text-orange-500" />
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <Link href="/login">
                  <button className="w-full border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium text-sm">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        <HeroSection onWatchDemo={() => setIsVideoModalOpen(true)} />
        <StatsSection />
        <InternshipGallery />
        <FeaturesSection />
        <CTASection />
      </main>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  )
}
