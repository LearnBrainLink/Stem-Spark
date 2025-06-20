"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { signOut } from "./actions"

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
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen hero-gradient flex">
      {/* Sidebar */}
      <aside className={`fixed md:static z-40 w-64 h-full bg-white/95 border-r border-gray-200 shadow-lg transition-transform duration-300 backdrop-blur-lg ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/images/novakinetix-logo.png" alt="Novakinetix Academy Logo" width={160} height={60} className="drop-shadow-2xl" priority />
            </Link>
            <button className="md:hidden p-2" onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <Link key={item.href} href={item.href} legacyBehavior>
                  <a
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg mx-2 font-medium transition-all duration-200 hover:bg-[var(--novakinetix-light)] hover:text-[var(--novakinetix-primary)] ${
                      isActive
                        ? 'bg-[var(--novakinetix-light)] text-[var(--novakinetix-primary)] shadow-inner' 
                        : 'text-gray-700'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.title}
                  </a>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 mt-auto border-t border-gray-100">
            <form action={signOut}>
              <Button 
                type="submit"
                className="w-full bg-[var(--novakinetix-primary)] hover:bg-[var(--novakinetix-accent)]"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-[var(--novakinetix-light)] via-white to-[var(--novakinetix-light)]">
        <button 
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white/95 rounded-full shadow-lg border border-gray-200" 
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-[var(--novakinetix-primary)]" />
        </button>
        <main className="p-6 pt-[90px] animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
