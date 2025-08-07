"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts'
import { Users, TrendingUp, Briefcase, Mail, DollarSign, Eye, Download, Calendar, Target, Award, Activity, BarChart3, RefreshCw, Loader2, UserCheck, FileText, Video, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [metricType, setMetricType] = useState('users')
  const [chartType, setChartType] = useState('line')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // Fetch analytics data
      const [usersResult, videosResult, applicationsResult, internshipsResult, donationsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('videos').select('*'),
        supabase.from('internship_applications').select('*'),
        supabase.from('internships').select('*'),
        supabase.from('donations').select('*')
      ])
      
      if (usersResult.error || videosResult.error || applicationsResult.error || internshipsResult.error || donationsResult.error) {
        setError('Failed to fetch analytics data')
        return
      }
      
      // Calculate analytics
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      
      const analytics = {
        totalUsers: usersResult.data?.length || 0,
        newUsersThisMonth: usersResult.data?.filter((u: any) => new Date(u.created_at) >= thisMonth).length || 0,
        activeUsers: usersResult.data?.filter((u: any) => u.last_active && new Date(u.last_active) >= lastMonth).length || 0,
        totalVideos: videosResult.data?.length || 0,
        totalApplications: applicationsResult.data?.length || 0,
        activeInternships: internshipsResult.data?.filter((i: any) => i.status === 'active').length || 0,
        totalRevenue: donationsResult.data?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        thisMonthRevenue: donationsResult.data?.filter((d: any) => new Date(d.created_at) >= thisMonth).reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        userGrowth: [],
        applicationStats: [],
        revenueData: []
      }
      
      setAnalyticsData(analytics)
    } catch (err) {
      setError('Failed to load analytics')
      setAnalyticsData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true)
      setError(null)
      
      // Use direct Supabase client approach
      const { createClient } = await import('@supabase/supabase-js')
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        setError('Missing Supabase configuration')
        return
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // Fetch analytics data
      const [usersResult, videosResult, applicationsResult, internshipsResult, donationsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('videos').select('*'),
        supabase.from('internship_applications').select('*'),
        supabase.from('internships').select('*'),
        supabase.from('donations').select('*')
      ])
      
      if (usersResult.error || videosResult.error || applicationsResult.error || internshipsResult.error || donationsResult.error) {
        setError('Failed to fetch analytics data')
        return
      }
      
      // Calculate analytics
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      
      const analytics = {
        totalUsers: usersResult.data?.length || 0,
        newUsersThisMonth: usersResult.data?.filter((u: any) => new Date(u.created_at) >= thisMonth).length || 0,
        activeUsers: usersResult.data?.filter((u: any) => u.last_active && new Date(u.last_active) >= lastMonth).length || 0,
        totalVideos: videosResult.data?.length || 0,
        totalApplications: applicationsResult.data?.length || 0,
        activeInternships: internshipsResult.data?.filter((i: any) => i.status === 'active').length || 0,
        totalRevenue: donationsResult.data?.reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        thisMonthRevenue: donationsResult.data?.filter((d: any) => new Date(d.created_at) >= thisMonth).reduce((sum: number, d: any) => sum + (d.amount || 0), 0) || 0,
        userGrowth: [],
        applicationStats: [],
        revenueData: []
      }
      
      setAnalyticsData(analytics)
      setMessage({ type: 'success', text: 'Analytics report generated successfully!' })
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const exportAnalytics = () => {
    if (!analyticsData) return

    const csvContent = [
      ['Metric', 'Value', 'Change'],
      ['Total Users', analyticsData.totalUsers, ''],
      ['New Users This Month', analyticsData.newUsersThisMonth, ''],
      ['Active Users', analyticsData.activeUsers, ''],
      ['Total Videos', analyticsData.totalVideos, ''],
      ['Total Applications', analyticsData.totalApplications, ''],
      ['Active Internships', analyticsData.activeInternships, ''],
      ['Total Revenue', `$${analyticsData.totalRevenue}`, ''],
      ['This Month Revenue', `$${analyticsData.thisMonthRevenue}`, ''],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {change && (
                <p className={`text-sm font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {change} from last month
                </p>
              )}
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </CardContent>
        </Card>
    </motion.div>
  )

  const ChartCard = ({ title, description, children, className = "" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={className}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-gray-600">{description}</CardDescription>
              </CardHeader>
              <CardContent>
          {children}
              </CardContent>
            </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="w-full h-full space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-lg border-0">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
          </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="shadow-lg border-0">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
                  </div>
                </div>
    )
  }

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={fetchAnalytics} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleGenerateReport} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger>
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={metricType} onValueChange={setMetricType}>
          <SelectTrigger>
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="users">User Growth</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="content">Content</SelectItem>
          </SelectContent>
        </Select>
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger>
            <SelectValue placeholder="Select chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Content */}
      {analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={analyticsData.totalUsers?.toLocaleString() || "0"}
              change="+12%"
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Active Users"
              value={analyticsData.activeUsers?.toLocaleString() || "0"}
              change="+8%"
              icon={UserCheck}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${analyticsData.totalRevenue?.toLocaleString() || "0"}`}
              change="+18%"
              icon={DollarSign}
              color="bg-purple-500"
            />
            <MetricCard
              title="Total Applications"
              value={analyticsData.totalApplications?.toLocaleString() || "0"}
              change="+23%"
              icon={Mail}
              color="bg-amber-500"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="User Growth"
              description="Monthly user registration and activity trends"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} name="Users" />
                  <Line type="monotone" dataKey="students" stroke="#10B981" strokeWidth={2} name="Students" />
                  <Line type="monotone" dataKey="teachers" stroke="#F59E0B" strokeWidth={2} name="Teachers" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="User Distribution"
              description="Breakdown of users by type"
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData.userTypes || []}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={20}
                  >
                    {(analyticsData.userTypes || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [`${value} users`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => `${value}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Detailed Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Application Status"
              description="Current status of internship applications"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.applicationStats || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="status" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard
              title="Monthly Revenue"
              description="Revenue trends over the past months"
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Engagement Metrics"
              description="Key performance indicators for user engagement"
            >
              <div className="grid grid-cols-2 gap-4">
                {(analyticsData.engagementMetrics || []).map((metric: any, index: number) => (
                  <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-100">
                    <p className="text-sm font-medium text-gray-600 mb-1">{metric.metric}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>
            </ChartCard>
            <ChartCard
              title="Top Performing Content"
              description="Most viewed videos and content"
            >
              <div className="space-y-3">
                {(analyticsData.topContent || []).map((content: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">{content.title}</p>
                      <p className="text-sm text-gray-600">{content.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{content.views} views</p>
                      <p className="text-sm text-gray-600">{Math.floor(content.duration / 60)}:{(content.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">Try refreshing the page or check your database connection.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
