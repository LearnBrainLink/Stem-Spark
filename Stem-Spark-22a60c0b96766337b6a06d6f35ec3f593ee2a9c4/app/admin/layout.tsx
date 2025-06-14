"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Video,
  Briefcase,
  BarChart3,
  Settings,
  Shield,
  Mail,
  FileText,
  Menu,
  X,
  Home,
  LogOut,
  GraduationCap,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "@/components/logo"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/enhanced-auth-actions"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    description: "Overview and quick stats",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage all users and permissions",
  },
  {
    title: "Content Moderation",
    href: "/admin/content",
    icon: FileText,
    description: "Review and moderate content",
  },
  {
    title: "Video Management",
    href: "/admin/videos",
    icon: Video,
    description: "Upload and manage videos",
  },
  {
    title: "Internship Management",
    href: "/admin/internships",
    icon: Briefcase,
    description: "Manage internship programs",
  },
  {
    title: "Applications",
    href: "/admin/applications",
    icon: Briefcase,
    description: "Review internship applications",
  },
  {
    title: "Analytics & Reports",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "View detailed analytics",
  },
  {
    title: "Email Configuration",
    href: "/admin/email-config",
    icon: Mail,
    description: "Configure email settings",
  },
  {
    title: "Admin Setup",
    href: "/admin/setup",
    icon: Shield,
    description: "Manage admin accounts",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      const result = await signOut()
      if (result.error) {
        console.error("Sign out error:", result.error)
      }
      // The signOut function will handle the redirect
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const currentPage = navigationItems.find((item) => item.href === pathname)

  return (
    <div className="min-h-screen hero-gradient">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-brand-light/30 z-30 shadow-sm">
        <div className="flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center">
                <Logo variant="large" className="h-8 w-auto hover:scale-105 transition-transform duration-300" />
              </Link>
              <Badge className="bg-brand-primary text-white border-0 shadow-brand text-sm px-3 py-1">
                <GraduationCap className="w-4 h-4 mr-2" />
                Admin Panel
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Link href="/profile">
                    <Button className="border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white px-4 py-2 rounded-md transition flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center text-white font-bold text-lg shadow-brand">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-sm font-semibold text-brand-primary">
                        {user.user_metadata?.full_name || user.email}
                      </p>
                    </div>
                  </div>
                </>
              )}
              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium text-sm px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
              <Button
                className="border-brand-light text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 px-4 py-2 rounded-md flex items-center"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="border-t border-brand-light/30 bg-white/50">
            <div className="flex items-center px-6 py-2 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200
                      ${isActive 
                        ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-brand" 
                        : "text-brand-secondary hover:bg-brand-accent/50"
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-[76px]">
        
        {/* Page Content */}
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
