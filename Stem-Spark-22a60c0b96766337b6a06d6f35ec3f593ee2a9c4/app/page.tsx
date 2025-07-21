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
import { Menu, X } from "lucide-react"
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Logo variant="nav" />
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="/videos"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Videos
              </a>
              <a
                href="/internships"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Internships
              </a>
              <Link
                href="/intern-application"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Apply as Intern
              </Link>
                          <a
              href="/communication-hub"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Communication Hub
            </a>
            <Link
              href="/ai-tutor"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              AI Tutor
            </Link>
            <Link
              href="/virtual-lab"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Virtual Lab
            </Link>
            <Link
              href="/competitions"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Competitions
            </Link>
            <Link
              href="/mentorship"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Mentorship
            </Link>
            <Link
              href="/career-pathway"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Career Pathway
            </Link>
            <Link
              href="/project-showcase"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Project Showcase
            </Link>
            <Link
              href="/learning-path"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Learning Paths
            </Link>
              <Link href="/login">
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium">
                  Sign In
                </button>
              </Link>
              <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </Link>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
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
          <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
            <div className="px-4 py-6 space-y-4">
              <a
                href="/videos"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Videos
              </a>
              <a
                href="/internships"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Internships
              </a>
              <Link
                href="/intern-application"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Apply as Intern
              </Link>
              <a
                href="/communication-hub"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Communication Hub
              </a>
              <Link
                href="/ai-tutor"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                AI Tutor
              </Link>
              <Link
                href="/virtual-lab"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Virtual Lab
              </Link>
              <Link
                href="/competitions"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Competitions
              </Link>
              <Link
                href="/mentorship"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Mentorship
              </Link>
              <Link
                href="/career-pathway"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Career Pathway
              </Link>
              <Link
                href="/project-showcase"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Project Showcase
              </Link>
              <Link
                href="/learning-path"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Learning Paths
              </Link>
              <div className="pt-4 space-y-3">
                <Link href="/login">
                  <button className="w-full border border-blue-600 text-blue-600 px-6 py-2 rounded-full hover:bg-blue-50 transition-colors font-medium">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
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
