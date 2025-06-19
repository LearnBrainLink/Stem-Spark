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
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
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
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname()
  const router = useRouter();

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
    setSigningOut(true);
    try {
      const result = await signOut();
      if (result?.redirectPath) {
        router.push(result.redirectPath);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setSigningOut(false);
    }
  }

  const currentPage = navigationItems.find((item) => item.href === pathname)

  return (
    <div className="min-h-screen hero-gradient flex">
      {/* Sidebar */}
      <aside className={`fixed md:static z-40 w-64 h-full bg-white/90 border-r border-gray-200 shadow-lg transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/images/novakinetix-logo.png" alt="Novakinetix Academy Logo" width={160} height={60} className="drop-shadow-2xl" priority />
            </Link>
            <button className="md:hidden p-2" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href} legacyBehavior>
                <a
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg mb-1 font-medium transition-colors duration-200 hover:bg-blue-50 hover:text-blue-700 ${pathname === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}`}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </a>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <Button onClick={handleSignOut} className="w-full" disabled={signingOut} variant="destructive">
              <LogOut className="w-5 h-5 mr-2" />
              {signingOut ? 'Signing out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 pt-[90px] min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/90 rounded-full shadow-lg border border-gray-200" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-blue-600" />
        </button>
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
