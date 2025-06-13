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
    await signOut()
  }

  const currentPage = navigationItems.find((item) => item.href === pathname)

  return (
    <div className="min-h-screen hero-gradient">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-brand-light/30 z-30 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-brand-primary hover:bg-brand-accent"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <Link href="/admin" className="flex items-center">
              <Logo variant="large" className="h-8 w-auto hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {user && (
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
            )}
            <Badge className="bg-green-100 text-green-700 border-green-200 font-medium text-sm px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              System Online
            </Badge>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        className={`
        fixed top-[73px] left-0 bottom-0 z-40 w-72 admin-sidebar shadow-brand-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Admin Badge */}
          <div className="px-6 py-4 border-b border-brand-light/30 bg-brand-accent/30">
            <div className="text-center">
              <Badge className="bg-brand-primary text-white border-0 shadow-brand text-base px-4 py-1.5">
                <GraduationCap className="w-4 h-4 mr-2" />
                Admin Panel
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      admin-nav-item
                      ${isActive ? "admin-nav-item-active" : "hover:bg-brand-accent/50"}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-sm">{item.title}</p>
                      <p className={`text-xs truncate ${isActive ? "text-white/80" : "text-brand-secondary"}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-brand-light/30">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 border-brand-light text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 py-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72 pt-[73px]">
        {/* Page Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-brand-light/30 sticky top-[73px] z-20 shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-brand-primary">{currentPage?.title || "Admin Dashboard"}</h1>
            <p className="text-sm text-brand-secondary font-medium mt-1">
              {currentPage?.description || "Manage your NOVAKINETIX ACADEMY platform"}
            </p>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
