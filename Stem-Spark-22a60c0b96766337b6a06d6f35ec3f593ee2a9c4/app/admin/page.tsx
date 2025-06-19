"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Video, Briefcase, Mail, BarChart3, Shield, ArrowRight, Bell, Search, Menu, X, Settings, LogOut, ChevronDown, TrendingUp, Activity, Calendar, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion";
import { AnalyticsLineChart } from '@/components/analytics-line-chart';

interface DailyStat {
  time: string;
  new_students: number;
  new_interns: number;
  [key: string]: number | string; // Index signature to match TimeSeriesData
}

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
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all stats in parallel
        const [
          { data: userStats },
          { data: videoStats },
          { data: internshipStats },
          { data: applicationStats },
          { data: emailTemplateStats }
        ] = await Promise.all([
          supabase.from("platform_user_stats").select("*").single(),
          supabase.from("platform_video_stats").select("*").single(),
          supabase.from("platform_internship_stats").select("*").single(),
          supabase.from("platform_application_stats").select("*").single(),
          supabase.from("platform_email_template_stats").select("*").single()
        ]);

        setStats({
          totalUsers: userStats?.total_users || 0,
          students: userStats?.students || 0,
          interns: userStats?.interns || 0,
          admins: userStats?.admins || 0,
          videos: videoStats?.total_videos || 0,
          internships: internshipStats?.total_internships || 0,
          applications: applicationStats?.total_applications || 0,
          emailTemplates: emailTemplateStats?.total_email_templates || 0,
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchDailyStats = async () => {
      const { data, error } = await supabase
        .from('platform_daily_stats')
        .select('day, new_students, new_interns')
        .order('day', { ascending: true })
        .limit(7);

      if (error) {
        console.error('Error fetching daily stats:', error);
      } else if (data) {
        const formattedData = data.map(d => ({ 
            time: new Date(d.day).toLocaleDateString(),
            new_students: d.new_students,
            new_interns: d.new_interns
        }));
        setDailyStats(formattedData);
      }
    };

    fetchDailyStats();
  }, []);

  // Corrected adminStats with all required properties for display
  const adminStats = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: "from-[var(--novakinetix-primary)] to-[var(--novakinetix-secondary)]",
      description: "All platform users"
    },
    {
      label: "Students",
      value: stats.students.toLocaleString(),
      icon: GraduationCap,
      gradient: "from-[var(--novakinetix-secondary)] to-[var(--novakinetix-accent)]",
      description: "Registered students"
    },
    {
      label: "Interns",
      value: stats.interns.toLocaleString(),
      icon: Users,
      gradient: "from-[var(--novakinetix-accent)] to-[var(--novakinetix-dark)]",
      description: "Registered interns"
    },
    {
      label: "Admins",
      value: stats.admins.toLocaleString(),
      icon: Shield,
      gradient: "from-[var(--novakinetix-primary)] to-[var(--novakinetix-dark)]",
      description: "Admin accounts"
    },
    {
      label: "Videos",
      value: stats.videos.toLocaleString(),
      icon: Video,
      gradient: "from-[var(--novakinetix-secondary)] to-[var(--novakinetix-primary)]",
      description: "Video lessons"
    },
    {
      label: "Internships",
      value: stats.internships.toLocaleString(),
      icon: Briefcase,
      gradient: "from-[var(--novakinetix-accent)] to-[var(--novakinetix-secondary)]",
      description: "Internship programs"
    },
    {
      label: "Applications",
      value: stats.applications.toLocaleString(),
      icon: Briefcase,
      gradient: "from-[var(--novakinetix-primary)] to-[var(--novakinetix-accent)]",
      description: "Internship applications"
    },
    {
      label: "Email Templates",
      value: stats.emailTemplates.toLocaleString(),
      icon: Mail,
      gradient: "from-[var(--novakinetix-secondary)] to-[var(--novakinetix-primary)]",
      description: "Email templates"
    },
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage accounts, roles & permissions",
      href: "/admin/users",
      icon: Users,
      count: `${stats.totalUsers.toLocaleString()} users`
    },
    {
      title: "Video Management",
      description: "Upload, organize & manage content",
      href: "/admin/videos",
      icon: Video,
      count: `${stats.videos.toLocaleString()} videos`
    },
    {
      title: "Internship Hub",
      description: "Review applications & manage programs",
      href: "/admin/applications",
      icon: Briefcase,
      count: `${stats.internships.toLocaleString()} internships, ${stats.applications.toLocaleString()} applications`
    },
    {
      title: "Email Center",
      description: "Configure templates & campaigns",
      href: "/admin/email-config",
      icon: Mail,
      count: `${stats.emailTemplates.toLocaleString()} templates`
    },
    {
      title: "Admin Console",
      description: "Manage administrators & security",
      href: "/admin/setup",
      icon: Shield,
      count: `${stats.admins.toLocaleString()} admins`
    },
    {
      title: "Analytics",
      description: "Insights, reports & performance data",
      href: "/admin/analytics",
      icon: BarChart3,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--novakinetix-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-600 text-lg font-medium">{error}</div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-[var(--novakinetix-primary)] hover:bg-[var(--novakinetix-accent)]"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Animated Background Pattern */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ duration: 1 }} className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
      </motion.div>

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
                  onClick={() => router.push(action.href)}
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
          <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }} className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
            <div className="relative">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your academy today</p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="stats-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <div className={`p-2 rounded-full bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsLineChart
                title="Last 7 Days - New Users"
                description="A quick look at new user registrations."
                data={dailyStats}
                lines={[
                    { dataKey: 'new_students', name: 'New Students', stroke: 'var(--novakinetix-primary)' },
                    { dataKey: 'new_interns', name: 'New Interns', stroke: 'var(--novakinetix-accent)' },
                ]}
            />
            {/* You can add another chart here if you like */}
          </div>

          {/* Quick Actions Grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
              <Button className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white">
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                >
                  <Button
                    variant="ghost"
                    className="quick-action-card w-full h-full"
                    onClick={() => router.push(action.href)}
                  >
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="p-2 rounded-full bg-[var(--novakinetix-light)]">
                          <action.icon className="w-5 h-5 text-[var(--novakinetix-primary)]" />
                        </div>
                        <Badge variant="secondary" className="bg-[var(--novakinetix-light)] text-[var(--novakinetix-primary)]">
                          {action.count}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
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
                    <motion.div whileHover={{ scale: 1.03 }} key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100">
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Welcome Back Modal */}
          {showWelcomeModal && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 border-2 border-blue-400 shadow-2xl rounded-2xl px-8 py-8 flex flex-col items-center animate-fade-in-up pointer-events-auto" style={{minWidth:'320px', maxWidth:'90vw'}}>
                <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome back, {userName}!</h2>
                <p className="text-lg text-blue-500 mb-2">We're glad to see you again. Ready to continue your journey?</p>
                <button className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all" onClick={() => setShowWelcomeModal(false)}>Close</button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}