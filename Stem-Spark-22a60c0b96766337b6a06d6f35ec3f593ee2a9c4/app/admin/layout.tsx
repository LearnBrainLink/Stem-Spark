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

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 admin-sidebar shadow-brand-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header with Large Logo */}
          <div className="flex items-center justify-center p-8 border-b border-brand-light/30">
            <Link href="/admin" className="flex items-center justify-center">
              <Logo variant="large" className="hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-brand-primary absolute top-4 right-4"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Admin Badge */}
          <div className="px-6 py-4 border-b border-brand-light/30 bg-brand-accent/30">
            <div className="text-center">
              <Badge className="bg-brand-primary text-white border-0 shadow-brand text-lg px-6 py-2">
                <GraduationCap className="w-5 h-5 mr-2" />
                Admin Panel
              </Badge>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-6 border-b border-brand-light/30 bg-brand-accent/20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 brand-gradient rounded-full flex items-center justify-center text-white font-bold text-xl shadow-brand">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-brand-primary truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-sm text-brand-secondary truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
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
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate text-base">{item.title}</p>
                      <p className={`text-sm truncate ${isActive ? "text-white/80" : "text-brand-secondary"}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-brand-light/30">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-brand-light text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-200 py-3"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-brand-light/30 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-brand-primary hover:bg-brand-accent"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-brand-primary">{currentPage?.title || "Admin Dashboard"}</h1>
                <p className="text-base text-brand-secondary font-medium mt-1">
                  {currentPage?.description || "Manage your NOVAKINETIX ACADEMY platform"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-700 border-green-200 font-medium text-base px-4 py-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                System Online
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
