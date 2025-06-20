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
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Sidebar */}
      <motion.aside 
        className={`fixed md:static z-40 w-64 h-screen bg-white/95 border-r border-gray-200 shadow-lg backdrop-blur-lg md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        initial={{ x: 0 }}
        animate={{ x: isSidebarOpen ? 0 : -256 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full">
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-gray-100"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/admin" className="flex items-center gap-2">
              <Image 
                src="/images/novakinetix-logo.png" 
                alt="Novakinetix Academy Logo" 
                width={140} 
                height={50} 
                className={`drop-shadow-lg transition-all duration-200 ${
                  pathname === "/admin" ? 'filter brightness-110 saturate-150' : ''
                }`} 
                priority 
              />
            </Link>
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </motion.div>
          
          <nav className="flex-1 overflow-y-auto py-2 space-y-1">
            {navigationItems.map((item, index) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mx-3 font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-[hsl(var(--novakinetix-primary))] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-[hsl(var(--novakinetix-primary))] hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </motion.div>
              )
            })}
          </nav>
          
          <motion.div 
            className="p-4 mt-auto border-t border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <form action={signOut}>
              <Button 
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </motion.div>
        </div>
      </motion.aside>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen md:ml-0">
        <motion.button 
          className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white/95 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200" 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-5 h-5 text-[hsl(var(--novakinetix-primary))]" />
        </motion.button>
        
        <motion.main 
          className="p-4 md:p-6 pt-16 md:pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
}
