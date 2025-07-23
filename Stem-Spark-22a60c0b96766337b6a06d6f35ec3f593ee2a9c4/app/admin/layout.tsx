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
  UserCheck,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { signOut } from "./actions"
import { motion, AnimatePresence } from "framer-motion"

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
    icon: UserCheck,
    description: "Review internship applications",
  },
  {
    title: "Analytics & Reports",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "View detailed analytics",
  },
  {
    title: "Communication Hub",
    href: "/admin/communication-hub",
    icon: MessageSquare,
    description: "Manage messaging and channels",
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
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="admin-layout bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar - Always visible on desktop, collapsible on mobile */}
      <div className={`admin-sidebar-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
            <Link href="/admin" className="flex items-center gap-2">
              <Image 
                src="/images/novakinetix-logo.png" 
                alt="Novakinetix Academy Logo" 
                width={140} 
                height={50} 
                className="drop-shadow-lg transition-all duration-200" 
                priority 
              />
            </Link>
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-2 px-3">
              {navigationItems.map((item, index) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-[hsl(var(--novakinetix-primary))] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-[hsl(var(--novakinetix-primary))] hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
          
          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form action={signOut}>
              <Button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content Area - Full Width */}
      <div className="admin-content-area">
        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-5 h-5 text-[hsl(var(--novakinetix-primary))]" />
        </button>
        
        {/* Content - Full Width and Height */}
        <main className="admin-main-content-full pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  )
}
