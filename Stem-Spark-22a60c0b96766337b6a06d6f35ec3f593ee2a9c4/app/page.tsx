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
import { Menu, X, Lock, Star, User, LogIn, BookOpen, Users, Award } from "lucide-react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [guestMode, setGuestMode] = useState(false)

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

  const handleGuestMode = () => {
    setGuestMode(true)
    // Guest mode - no data storage, session only
    sessionStorage.setItem('guestMode', 'true')
  }

  const handleGuestLogout = () => {
    setGuestMode(false)
    sessionStorage.removeItem('guestMode')
  }

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <FloatingElements />
      
      {/* Simplified Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <Logo variant="nav" />
              </Link>
            </div>
            
            {/* Desktop Navigation - Simplified */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Core Navigation Links */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/videos"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Videos
                </Link>
                <Link
                  href="/internships"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Internships
                </Link>
                <Link
                  href="/communication-hub"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Community
                </Link>
                <Link
                  href="/learning-path"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  Learning
                </Link>
                <Link
                  href="/ai-tutor"
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                >
                  AI Tutor
                </Link>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
                {guestMode ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Guest Mode</span>
                    <button 
                      onClick={handleGuestLogout}
                      className="text-gray-600 hover:text-red-600 transition-colors font-medium text-sm"
                    >
                      Exit Guest
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                    </Link>
                    <button 
                      onClick={handleGuestMode}
                      className="px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors font-medium text-sm whitespace-nowrap"
                    >
                      Try as Guest
                    </button>
                    <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm whitespace-nowrap">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
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

        {/* Mobile Navigation - Simplified */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-6 space-y-4">
              {/* Core Navigation Links */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Navigation</h3>
                <Link
                  href="/videos"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2"
                >
                  Videos
                </Link>
                <Link
                  href="/internships"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2"
                >
                  Internships
                </Link>
                <Link
                  href="/communication-hub"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2"
                >
                  Community
                </Link>
                <Link
                  href="/learning-path"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2"
                >
                  Learning
                </Link>
                <Link
                  href="/ai-tutor"
                  className="block text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm py-2"
                >
                  AI Tutor
                </Link>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                {guestMode ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">Guest Mode Active</span>
                    </div>
                    <button 
                      onClick={handleGuestLogout}
                      className="w-full border border-red-300 text-red-600 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                    >
                      Exit Guest Mode
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <button className="w-full flex items-center justify-center space-x-2 border border-blue-600 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                    </Link>
                    <button 
                      onClick={handleGuestMode}
                      className="w-full border border-gray-300 text-gray-600 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Try as Guest
                    </button>
                    <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"} className="block">
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg text-sm">
                        Get Started
                      </button>
                    </Link>
                  </>
                )}
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
