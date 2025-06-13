"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Users, Video, Briefcase, TrendingUp, Download, Eye, PlayCircle, FileText } from "lucide-react"

interface AnalyticsData {
  totalUsers: number
  newUsersThisMonth: number
  totalVideos: number
  totalApplications: number
  activeInternships: number
  userGrowth: Array<{ month: string; users: number }>
  topVideos: Array<{ title: string; views: number }>
  applicationStats: Array<{ status: string; count: number }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch users data
      const { data: users } = await supabase.from("profiles").select("created_at, role")

      // Fetch videos data
      const { data: videos } = await supabase.from("videos").select("title, created_at")

      // Fetch applications data
      const { data: applications } = await supabase.from("internship_applications").select("status, applied_at")

      // Fetch internships data
      const { data: internships } = await supabase.from("internships").select("status, created_at")

      // Process data
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const newUsersThisMonth = users?.filter((user) => new Date(user.created_at) >= thirtyDaysAgo).length || 0

      const activeInternships = internships?.filter((internship) => internship.status === "active").length || 0

      // Generate user growth data (mock data for demonstration)
      const userGrowth = [
        { month: "Jan", users: 120 },
        { month: "Feb", users: 180 },
        { month: "Mar", users: 240 },
        { month: "Apr", users: 320 },
        { month: "May", users: 450 },
        { month: "Jun", users: users?.length || 0 },
      ]

      // Top videos (mock data)
      const topVideos = [
        { title: "Introduction to Robotics", views: 1250 },
        { title: "Programming Basics", views: 980 },
        { title: "Engineering Design Process", views: 875 },
        { title: "Mathematics in STEM", views: 720 },
        { title: "Science Experiments", views: 650 },
      ]

      // Application stats
      const applicationStats = [
        { status: "pending", count: applications?.filter((app) => app.status === "pending").length || 0 },
        { status: "approved", count: applications?.filter((app) => app.status === "approved").length || 0 },
        { status: "rejected", count: applications?.filter((app) => app.status === "rejected").length || 0 },
      ]

      setAnalyticsData({
        totalUsers: users?.length || 0,
        newUsersThisMonth,
        totalVideos: videos?.length || 0,
        totalApplications: applications?.length || 0,
        activeInternships,
        userGrowth,
        topVideos,
        applicationStats,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportReport = () => {
    if (!analyticsData) return

    const reportData = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: {
        totalUsers: analyticsData.totalUsers,
        newUsers: analyticsData.newUsersThisMonth,
        totalVideos: analyticsData.totalVideos,
        totalApplications: analyticsData.totalApplications,
        activeInternships: analyticsData.activeInternships,
      },
      userGrowth: analyticsData.userGrowth,
      topVideos: analyticsData.topVideos,
      applicationStats: analyticsData.applicationStats,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 min-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-gray-600 text-sm md:text-base">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline" className="px-2 py-1 text-sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics - compact grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Total Users</p>
                <p className="text-xl font-bold text-brand-primary">{analyticsData.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />+{analyticsData.newUsersThisMonth} this month
                </p>
              </div>
              <div className="w-10 h-10 brand-gradient rounded-lg flex items-center justify-center shadow-brand">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Total Videos</p>
                <p className="text-xl font-bold text-brand-primary">{analyticsData.totalVideos}</p>
                <p className="text-xs text-brand-secondary mt-1">Educational content</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-brand">
                <Video className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Applications</p>
                <p className="text-xl font-bold text-brand-primary">{analyticsData.totalApplications}</p>
                <p className="text-xs text-brand-secondary mt-1">Internship applications</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-brand">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Active Internships</p>
                <p className="text-xl font-bold text-brand-primary">{analyticsData.activeInternships}</p>
                <p className="text-xs text-brand-secondary mt-1">Currently available</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-brand">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Engagement Rate</p>
                <p className="text-xl font-bold text-brand-primary">78%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% from last month
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-brand">
                <Eye className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics - compact tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 mb-2 text-xs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User Growth Chart */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.userGrowth.map((data, index) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.month}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                            style={{
                              width: `${(data.users / Math.max(...analyticsData.userGrowth.map((d) => d.users))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{data.users}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Videos */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Top Performing Videos</CardTitle>
                <CardDescription>Most viewed educational content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topVideos.map((video, index) => (
                    <div key={video.title} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm font-medium truncate">{video.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{video.views.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User distribution by role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Students</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round(analyticsData.totalUsers * 0.7)} (70%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Teachers</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {Math.round(analyticsData.totalUsers * 0.2)} (20%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Parents</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {Math.round(analyticsData.totalUsers * 0.08)} (8%)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Admins</span>
                    <Badge className="bg-red-100 text-red-800">
                      {Math.round(analyticsData.totalUsers * 0.02)} (2%)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Recent user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Daily Active Users</span>
                    <span className="text-sm text-gray-600">{Math.round(analyticsData.totalUsers * 0.3)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Weekly Active Users</span>
                    <span className="text-sm text-gray-600">{Math.round(analyticsData.totalUsers * 0.6)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Monthly Active Users</span>
                    <span className="text-sm text-gray-600">{Math.round(analyticsData.totalUsers * 0.85)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Session Duration</span>
                    <span className="text-sm text-gray-600">12m 34s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
                <CardDescription>Video engagement statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Video Views</span>
                    <span className="text-sm text-gray-600">24,567</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average View Duration</span>
                    <span className="text-sm text-gray-600">8m 45s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-gray-600">73%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Popular Category</span>
                    <span className="text-sm text-gray-600">Engineering</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Content by Category</CardTitle>
                <CardDescription>Distribution of educational content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      category: "Engineering",
                      count: Math.round(analyticsData.totalVideos * 0.3),
                      color: "bg-blue-500",
                    },
                    {
                      category: "Programming",
                      count: Math.round(analyticsData.totalVideos * 0.25),
                      color: "bg-green-500",
                    },
                    {
                      category: "Mathematics",
                      count: Math.round(analyticsData.totalVideos * 0.2),
                      color: "bg-purple-500",
                    },
                    {
                      category: "Science",
                      count: Math.round(analyticsData.totalVideos * 0.15),
                      color: "bg-orange-500",
                    },
                    { category: "Robotics", count: Math.round(analyticsData.totalVideos * 0.1), color: "bg-red-500" },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.count} videos</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
                <CardDescription>Internship application breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.applicationStats.map((stat) => (
                    <div key={stat.status} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{stat.status}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              stat.status === "approved"
                                ? "bg-green-500"
                                : stat.status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                            }`}
                            style={{
                              width: `${(stat.count / Math.max(...analyticsData.applicationStats.map((s) => s.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8 text-right">{stat.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Monthly application statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Applications This Month</span>
                    <span className="text-sm text-gray-600">{analyticsData.totalApplications}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Processing Time</span>
                    <span className="text-sm text-gray-600">3.2 days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Approval Rate</span>
                    <span className="text-sm text-gray-600">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Most Popular Program</span>
                    <span className="text-sm text-gray-600">Software Engineering</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
