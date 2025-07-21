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
              <a
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="/contact"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
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
              <a
                href="/about"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="/contact"
                className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Contact
              </a>
              <div className="flex gap-3 pt-4">
                <Link href="/login">
                  <button className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-full hover:bg-blue-50 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href={isLoggedIn ? "/dashboard" : "/sign%20up"}>
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Main Content */}
      <main>
        <HeroSection onWatchDemo={() => setIsVideoModalOpen(true)} />
        <StatsSection />
        <InternshipGallery />
        <FeaturesSection />
        <CTASection />
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <Logo variant="large" className="drop-shadow-xl" />
                <span className="text-2xl font-bold">STEM Spark Academy</span>
              </div>
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                Empowering the next generation of innovators through cutting-edge
                STEM education and real-world learning experiences.
              </p>
              <div className="flex gap-4">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm">
                  🚀 Innovation
                </span>
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm">
                  🎓 Education
                </span>
                <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm">
                  💡 Excellence
                </span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-xl">Quick Links</h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Videos
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Internships
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Resources
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Calendar
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-6 text-xl">Support</h3>
              <div className="space-y-3">
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="block text-gray-300 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 Novakinetix Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  )
}
