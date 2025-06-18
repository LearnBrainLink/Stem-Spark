"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Video, Briefcase, Mail, BarChart3, Shield, ArrowRight, Bell, Search, Menu, X, Settings, LogOut, ChevronDown, TrendingUp, Activity, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [userName, setUserName] = useState("Admin"); // New state for user name
  const [showWelcomeModal, setShowWelcomeModal] = useState(true); // State to control welcome modal

  // Add state for live stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    interns: 0,
    admins: 0,
    videos: 0,
    internships: 0,
    applications: 0,
    emailTemplates: 0,
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      // Users
      const { count: userCount } = await supabase.from("profiles").select("id", { count: "exact", head: true })
      // Students
      const { count: studentCount } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student")
      // Interns
      const { count: internCount } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "intern")
      // Admins
      const { count: adminCount } = await supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin")
      // Videos
      const { count: videoCount } = await supabase.from("videos").select("id", { count: "exact", head: true })
      // Internships
      const { count: internshipCount } = await supabase.from("internships").select("id", { count: "exact", head: true })
      // Applications
      const { count: applicationCount } = await supabase.from("internship_applications").select("id", { count: "exact", head: true })
      // Email templates (if table exists)
      let emailTemplateCount = 0
      try {
        const { count } = await supabase.from("email_templates").select("id", { count: "exact", head: true })
        emailTemplateCount = count || 0
      } catch {}
      setStats({
        totalUsers: userCount || 0,
        students: studentCount || 0,
        interns: internCount || 0,
        admins: adminCount || 0,
        videos: videoCount || 0,
        internships: internshipCount || 0,
        applications: applicationCount || 0,
        emailTemplates: emailTemplateCount,
      })
    }
    fetchStats()
  }, [])

  // Corrected adminStats with all required properties for display
  const adminStats = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      change: "",
      trend: "",
      description: "All platform users"
    },
    {
      label: "Students",
      value: stats.students.toLocaleString(),
      icon: GraduationCap,
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      change: "",
      trend: "",
      description: "Registered students"
    },
    {
      label: "Interns",
      value: stats.interns.toLocaleString(),
      icon: Users,
      gradient: "from-yellow-500 via-orange-400 to-orange-600",
      change: "",
      trend: "",
      description: "Registered interns"
    },
    {
      label: "Admins",
      value: stats.admins.toLocaleString(),
      icon: Shield,
      gradient: "from-red-500 via-rose-500 to-pink-500",
      change: "",
      trend: "",
      description: "Admin accounts"
    },
    {
      label: "Videos",
      value: stats.videos.toLocaleString(),
      icon: Video,
      gradient: "from-purple-500 via-violet-600 to-purple-700",
      change: "",
      trend: "",
      description: "Video lessons"
    },
    {
      label: "Internships",
      value: stats.internships.toLocaleString(),
      icon: Briefcase,
      gradient: "from-orange-500 via-amber-600 to-yellow-600",
      change: "",
      trend: "",
      description: "Internship programs"
    },
    {
      label: "Applications",
      value: stats.applications.toLocaleString(),
      icon: Briefcase,
      gradient: "from-blue-400 via-blue-600 to-indigo-600",
      change: "",
      trend: "",
      description: "Internship applications"
    },
    {
      label: "Email Templates",
      value: stats.emailTemplates.toLocaleString(),
      icon: Mail,
      gradient: "from-emerald-500 via-green-500 to-lime-500",
      change: "",
      trend: "",
      description: "Email templates"
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage accounts, roles & permissions",
      href: "/admin/users",
      icon: Users,
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      count: `${stats.totalUsers.toLocaleString()} users`
    },
    {
      title: "Video Management",
      description: "Upload, organize & manage content",
      href: "/admin/videos",
      icon: Video,
      gradient: "from-purple-500 via-pink-500 to-rose-500",
      count: `${stats.videos.toLocaleString()} videos`
    },
    {
      title: "Internship Hub",
      description: "Review applications & manage programs",
      href: "/admin/applications",
      icon: Briefcase,
      gradient: "from-orange-500 via-red-500 to-pink-500",
      count: `${stats.internships.toLocaleString()} internships, ${stats.applications.toLocaleString()} applications`
    },
    {
      title: "Email Center",
      description: "Configure templates & campaigns",
      href: "/admin/email-config",
      icon: Mail,
      gradient: "from-emerald-500 via-green-500 to-lime-500",
      count: `${stats.emailTemplates.toLocaleString()} templates`
    },
    {
      title: "Admin Console",
      description: "Manage administrators & security",
      href: "/admin/setup",
      icon: Shield,
      gradient: "from-red-500 via-rose-500 to-pink-500",
      count: `${stats.admins.toLocaleString()} admins`
    },
    {
      title: "Analytics",
      description: "Insights, reports & performance data",
      href: "/admin/analytics",
      icon: BarChart3,
      gradient: "from-indigo-500 via-blue-500 to-cyan-500",
      count: "Live data"
    },
  ];

  const recentActivities = [
    {
      icon: Users,
      title: "New student enrollment",
      description: "Sarah Johnson enrolled in Advanced Robotics",
      time: "2 minutes ago",
      gradient: "from-blue-500 to-cyan-500",
      type: "enrollment"
    },
    {
      icon: Video,
      title: "Content published",
      description: "Machine Learning Basics - Chapter 3 is now live",
      time: "15 minutes ago",
      gradient: "from-purple-500 to-pink-500",
      type: "content"
    },
    {
      icon: Briefcase,
      title: "Internship application",
      description: "Alex Chen applied for Software Engineering role",
      time: "1 hour ago",
      gradient: "from-orange-500 to-red-500",
      type: "application"
    },
    {
      icon: BarChart3,
      title: "Monthly report generated",
      description: "October performance metrics are ready",
      time: "2 hours ago",
      gradient: "from-emerald-500 to-teal-500",
      type: "report"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-lg shadow-blue-500/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Novakinetix Academy
                </h1>
                <p className="text-sm text-gray-500 font-medium">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 group">
              <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm w-40 placeholder-gray-400"
              />
              <kbd className="hidden md:inline-block px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded border">⌘K</kbd>
            </div>
            
            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-white/80 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg group">
              <Bell className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>

            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 px-3 py-1.5 shadow-md">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              Online
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-72 h-screen bg-white/80 backdrop-blur-xl border-r border-white/20 transition-all duration-300 ease-out shadow-2xl md:shadow-none`}>
          <div className="p-6 h-full flex flex-col">
            {/* Time Widget */}
            <div className="mb-8 p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-200/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Current Time</span>
              </div>
              <div className="text-2xl font-mono font-bold text-gray-800">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</div>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 text-left group hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 group-hover:text-gray-900">{action.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{action.count}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
                </button>
              ))}
            </nav>

            {/* Quick Settings */}
            <div className="mt-auto pt-6 border-t border-gray-200/50">
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8 overflow-auto relative">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your academy today</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat, index: number) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group bg-white/80 backdrop-blur-sm hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    {/* Remove change/trend if not used visually */}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</p>
                    <p className="text-xs text-gray-400">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              <Button className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index: number) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden hover:scale-105">
                  <div className={`h-1 bg-gradient-to-r ${action.gradient}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-gray-900">{action.title}</CardTitle>
                        <CardDescription className="text-gray-600 text-sm mt-1">{action.description}</CardDescription>
                        <Badge className="mt-3 text-xs bg-gray-100 text-gray-600">
                          {action.count}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className={`w-full bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-300 border-0 text-white font-semibold rounded-xl`}>
                      Open {action.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-600">Latest platform activities and updates</CardDescription>
                  </div>
                </div>
                <Button className="bg-white/80 text-xs px-3 py-1">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${activity.gradient} text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {activity.time}
                      </span>
                      <Badge className="mt-2 text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Welcome Back Modal */}
          {showWelcomeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 border-2 border-blue-400 shadow-2xl rounded-2xl px-8 py-8 flex flex-col items-center animate-fade-in-up pointer-events-auto" style={{minWidth:'320px', maxWidth:'90vw'}}>
                <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome back, {userName}!</h2>
                <p className="text-lg text-blue-500 mb-2">We're glad to see you again. Ready to continue your journey?</p>
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all" onClick={() => setShowWelcomeModal(false)}>Close</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}