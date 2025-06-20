"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Video, Briefcase, TrendingUp, Download, Eye, PlayCircle, FileText } from "lucide-react"
import { AnalyticsLineChart } from '@/components/analytics-line-chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getAnalyticsData } from '../actions'

interface AnalyticsData {
  totalUsers: number
  newUsersThisMonth: number
  totalVideos: number
  totalApplications: number
  activeInternships: number
  userGrowth: Array<{ month: string; users: number }>
  applicationStats: Array<{ status: string; count: number }>
  topVideos?: Array<{ title: string; views: number }>
}

// Sample data for demonstration until real data is fetched
const sampleLineData = [
  { time: '2023-01-01', new_students: 4, new_interns: 2 },
  { time: '2023-01-02', new_students: 3, new_interns: 1 },
  { time: '2023-01-03', new_students: 2, new_interns: 5 },
  { time: '2023-01-04', new_students: 7, new_interns: 3 },
  { time: '2023-01-05', new_students: 5, new_interns: 4 },
  { time: '2023-01-06', new_students: 8, new_interns: 2 },
  { time: '2023-01-07', new_students: 10, new_interns: 6 },
]

// Top videos (sample data)
const topVideos = [
  { title: "Introduction to Robotics", views: 1250 },
  { title: "Programming Basics", views: 980 },
  { title: "Engineering Design Process", views: 875 },
  { title: "Mathematics in STEM", views: 720 },
  { title: "Science Experiments", views: 650 },
]

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("30d")
  const [dailyStats, setDailyStats] = useState(sampleLineData)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getAnalyticsData()
      
      if (result.error) {
        setError(result.error)
        console.error("Analytics fetch error:", result.error)
      } else if (result.data) {
        setAnalyticsData({
          ...result.data,
          topVideos, // Use sample data for top videos since we don't have view counts
        })
      }
    } catch (err) {
      setError('Failed to load analytics data')
      console.error("Error fetching analytics:", err)
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
        <p className="ml-4 text-gray-600">Loading real analytics data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 font-medium">Error loading analytics</p>
          <p className="text-red-500 text-sm mt-2">{error}</p>
          <Button 
            onClick={fetchAnalyticsData} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights from your Supabase database</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
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
                <p className="text-xs font-medium text-brand-secondary">Videos</p>
                <p className="text-xl font-bold text-brand-primary">{analyticsData.totalVideos}</p>
                <p className="text-xs text-gray-500">Total content</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
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
                <p className="text-xs text-gray-500">All submissions</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-600" />
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
                <p className="text-xs text-gray-500">Currently running</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-brand-secondary">Growth Rate</p>
                <p className="text-xl font-bold text-brand-primary">
                  {analyticsData.totalUsers > 0 ? Math.round((analyticsData.newUsersThisMonth / analyticsData.totalUsers) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500">Monthly growth</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly new user registrations (Real Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>Current application distribution (Real Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Videos</CardTitle>
            <CardDescription>Most viewed content (Sample Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVideos.map((video, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <PlayCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.views} views</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Platform engagement over time (Sample Data)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <AnalyticsLineChart 
                data={dailyStats}
                title="Daily Activity"
                description="Platform engagement over time"
                lines={[
                  { dataKey: 'new_students', name: 'New Students', stroke: '#3b82f6' },
                  { dataKey: 'new_interns', name: 'New Interns', stroke: '#10b981' },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
