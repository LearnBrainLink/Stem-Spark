"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Video, Briefcase, Mail, BarChart3, Shield, ArrowRight, Bell, Search, Menu, X } from "lucide-react";
import Image from "next/image";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const adminStats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "from-blue-500 to-blue-600", change: "+12%" },
    { label: "Active Students", value: "856", icon: GraduationCap, color: "from-emerald-500 to-emerald-600", change: "+8%" },
    { label: "Video Lessons", value: "45", icon: Video, color: "from-purple-500 to-purple-600", change: "+3" },
    { label: "Internships", value: "23", icon: Briefcase, color: "from-orange-500 to-orange-600", change: "+5" },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Video Management",
      description: "Upload and manage educational videos",
      href: "/admin/videos",
      icon: Video,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "Internship Applications",
      description: "Review and manage applications",
      href: "/admin/applications",
      icon: Briefcase,
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Email Configuration",
      description: "Configure email settings and templates",
      href: "/admin/email-config",
      icon: Mail,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      title: "Admin Setup",
      description: "Create and manage admin accounts",
      href: "/admin/setup",
      icon: Shield,
      gradient: "from-red-500 to-pink-500",
    },
    {
      title: "Analytics",
      description: "View platform analytics and reports",
      href: "/admin/analytics",
      icon: BarChart3,
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const recentActivities = [
    {
      icon: Users,
      title: "New user registration",
      description: "student@example.com joined as a student",
      time: "2 hours ago",
      color: "text-blue-500"
    },
    {
      icon: Video,
      title: "Video uploaded",
      description: "Introduction to Robotics added to library",
      time: "5 hours ago",
      color: "text-purple-500"
    },
    {
      icon: Briefcase,
      title: "Internship application",
      description: "New application for Summer Engineering Program",
      time: "1 day ago",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 flex items-center justify-center">
                <Image src="/images/novakinetix-logo.png" alt="Novakinetix Academy Logo" width={260} height={90} className="mx-auto my-8 drop-shadow-2xl" priority />
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-32"
              />
            </div>
            
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <Badge className="text-emerald-600 border-emerald-200 bg-emerald-50 px-3 py-1">
              System Online
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-30 w-64 h-screen bg-white/90 backdrop-blur-md border-r border-gray-200 transition-transform duration-300 ease-in-out shadow-lg md:shadow-none`}>
          <div className="p-6">
            <div className="mb-8">
              <div className="text-sm text-gray-500 mb-2">Current Time</div>
              <div className="text-lg font-mono text-gray-800">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>

            <nav className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 text-left group"
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} text-white shadow-md group-hover:shadow-lg transition-shadow`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{action.title}</div>
                    <div className="text-xs text-gray-500">{action.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group bg-white/80 backdrop-blur-sm">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <Badge className="text-xs bg-green-100 text-green-700">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions Grid */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${action.gradient}`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-xl bg-gradient-to-r ${action.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-800">{action.title}</CardTitle>
                        <CardDescription className="text-gray-600">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className={`w-full bg-gradient-to-r ${action.gradient} hover:shadow-lg transition-all duration-200 border-0 text-white font-semibold`}>
                      Access {action.title}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-600">Latest platform activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`p-3 rounded-xl ${activity.color} bg-current bg-opacity-10`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}