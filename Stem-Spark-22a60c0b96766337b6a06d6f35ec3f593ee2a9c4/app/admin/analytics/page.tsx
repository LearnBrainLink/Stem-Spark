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
      
      // Fetch analytics data from the API endpoint
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      
      // Calculate analytics from the fetched data
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      
      const analytics = {
        totalUsers: data.totalUsers || 0,
        newUsersThisMonth: data.userGrowthChart?.[data.userGrowthChart.length - 1]?.users || 0,
        activeUsers: data.totalUsers || 0, // Simplified for now
        totalVideos: data.totalVideos || 0,
        totalApplications: data.totalApplications || 0,
        activeInternships: data.activeInternships || 0,
        totalRevenue: data.totalRevenue || 0,
        thisMonthRevenue: data.thisMonthRevenue || 0,
        userGrowth: data.userGrowthChart || [],
        applicationStats: data.activityTrendsChart || [],
        revenueData: data.activityTrendsChart || [],
        totalMessages: data.totalMessages || 0,
        totalChannels: data.totalChannels || 0,
        volunteerHours: data.totalVolunteerHours || 0,
        pendingHours: data.pendingHours || 0,
        approvedHours: data.totalApprovedHours || 0
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
      
      // Generate comprehensive report using the analytics data
      const reportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        metrics: analyticsData,
        summary: {
          totalUsers: analyticsData?.totalUsers || 0,
          totalRevenue: analyticsData?.totalRevenue || 0,
          totalApplications: analyticsData?.totalApplications || 0,
          totalVideos: analyticsData?.totalVideos || 0
        }
      }
      
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({ type: 'success', text: 'Report generated successfully!' })
      
      // Download the report
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
    } catch (err) {
      setError('Failed to generate report')
      setMessage({ type: 'error', text: 'Failed to generate report' })
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const exportAnalytics = () => {
    if (!analyticsData) return
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analyticsData.totalUsers],
      ['Total Revenue', analyticsData.totalRevenue],
      ['Total Applications', analyticsData.totalApplications],
      ['Total Videos', analyticsData.totalVideos],
      ['Total Messages', analyticsData.totalMessages],
      ['Total Channels', analyticsData.totalChannels],
      ['Volunteer Hours', analyticsData.volunteerHours],
      ['Pending Hours', analyticsData.pendingHours],
      ['Approved Hours', analyticsData.approvedHours]
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const MetricCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {change && (
            <p className={`text-xs ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const ChartCard = ({ title, description, children, className = "" }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className={`shadow-md ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
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

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Real-time insights and performance metrics</p>
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
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportAnalytics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGeneratingReport}
            size="sm"
          >
            {isGeneratingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={analyticsData?.totalUsers || 0}
          change="+12%"
          icon={Users}
          color="text-blue-600"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData?.totalRevenue?.toLocaleString() || 0}`}
          change="+8%"
          icon={DollarSign}
          color="text-green-600"
        />
        <MetricCard
          title="Applications"
          value={analyticsData?.totalApplications || 0}
          change="+15%"
          icon={Briefcase}
          color="text-purple-600"
        />
        <MetricCard
          title="Videos"
          value={analyticsData?.totalVideos || 0}
          change="+5%"
          icon={Video}
          color="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="User Growth"
          description="Monthly user registration trends"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Activity Trends"
          description="Messages and applications over time"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analyticsData?.activityTrendsChart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="messages" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="applications" 
                stackId="1"
                stroke="#F59E0B" 
                fill="#F59E0B" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="User Distribution"
          description="Breakdown by user roles"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Students', value: analyticsData?.students || 0 },
                  { name: 'Admins', value: analyticsData?.admins || 0 },
                  { name: 'Teachers', value: analyticsData?.teachers || 0 },
                  { name: 'Parents', value: analyticsData?.parents || 0 },
                  { name: 'Interns', value: analyticsData?.interns || 0 }
                ].filter(item => item.value > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Volunteer Hours"
          description="Monthly volunteer hours logged"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.volunteerHoursChart || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Revenue Overview"
          description="Monthly revenue trends"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.revenueData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
