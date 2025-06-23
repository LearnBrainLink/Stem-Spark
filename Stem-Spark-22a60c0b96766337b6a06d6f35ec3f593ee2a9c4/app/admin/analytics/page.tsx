"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts'
import { Users, TrendingUp, Briefcase, Mail, DollarSign, Eye, Download, Calendar, Target, Award, Activity, BarChart3, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { getEnhancedDashboardStats } from '../enhanced-actions'

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4']

const sampleAnalyticsData = {
  totalUsers: 1247,
  newUsersThisMonth: 89,
  totalVideos: 156,
  totalApplications: 342,
  activeInternships: 23,
  userGrowth: [
    { month: 'Jan', users: 420, interns: 240, applications: 180 },
    { month: 'Feb', users: 380, interns: 139, applications: 220 },
    { month: 'Mar', users: 520, interns: 980, applications: 340 },
    { month: 'Apr', users: 478, interns: 390, applications: 280 },
    { month: 'May', users: 589, interns: 480, applications: 420 },
    { month: 'Jun', users: 639, interns: 380, applications: 380 },
    { month: 'Jul', users: 749, interns: 430, applications: 520 },
  ],
  applicationStats: [
    { status: 'pending', count: 156, color: '#F59E0B' },
    { status: 'approved', count: 89, color: '#10B981' },
    { status: 'rejected', count: 97, color: '#EF4444' },
  ],
  userTypes: [
    { type: 'Students', count: 810, percentage: 65 },
    { type: 'Teachers', count: 249, percentage: 20 },
    { type: 'Admins', count: 188, percentage: 15 },
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15800 },
    { month: 'Mar', revenue: 18900 },
    { month: 'Apr', revenue: 14200 },
    { month: 'May', revenue: 22100 },
    { month: 'Jun', revenue: 19800 },
    { month: 'Jul', revenue: 25600 },
  ],
  engagementMetrics: [
    { metric: 'Page Views', value: 45600, change: '+12%' },
    { metric: 'Session Duration', value: '4m 32s', change: '+8%' },
    { metric: 'Bounce Rate', value: '23%', change: '-5%' },
    { metric: 'Conversion Rate', value: '3.2%', change: '+15%' },
  ]
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getEnhancedDashboardStats()
      
      if (result.error) {
        setError(result.error)
        setAnalyticsData(null)
      } else if (result.stats) {
        setAnalyticsData(result.stats)
      } else {
        setAnalyticsData(null)
      }
    } catch (err) {
      setError('Failed to load analytics')
      setAnalyticsData(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Use real data for charts, fallback to sample data if needed
  const displayChartData = analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? analyticsData.userGrowth : sampleAnalyticsData.userGrowth;
  const displayUserDistribution = analyticsData?.userTypes && analyticsData.userTypes.length > 0 ? analyticsData.userTypes : sampleAnalyticsData.userTypes;
  const displayApplicationStats = analyticsData?.applicationStats && analyticsData.applicationStats.length > 0 ? analyticsData.applicationStats : sampleAnalyticsData.applicationStats;
  const displayMonthlyRevenue = analyticsData?.monthlyRevenue && analyticsData.monthlyRevenue.length > 0 ? analyticsData.monthlyRevenue : sampleAnalyticsData.monthlyRevenue;
  const displayEngagementMetrics = analyticsData?.engagementMetrics && analyticsData.engagementMetrics.length > 0 ? analyticsData.engagementMetrics : sampleAnalyticsData.engagementMetrics;

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
      <div className="space-y-6 p-6">
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Analytics & Reports</h1>
            <p className="text-gray-600">View detailed analytics and platform insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
                  </div>
                </div>
      </motion.header>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MetricCard
          title="Total Users"
          value={analyticsData?.totalUsers?.toLocaleString() || '0'}
          change="+12%"
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="New Users"
          value={analyticsData?.newUsersThisMonth?.toLocaleString() || '0'}
          change="+8%"
          icon={TrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Active Internships"
          value={analyticsData?.activeInternships?.toLocaleString() || '0'}
          change="+15%"
          icon={Briefcase}
          color="bg-purple-500"
        />
        <MetricCard
          title="Total Applications"
          value={analyticsData?.totalApplications?.toLocaleString() || '0'}
          change="+23%"
          icon={Mail}
          color="bg-amber-500"
        />
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth Chart */}
        <ChartCard
          title="User Growth"
          description="Monthly user registration and activity trends"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={displayChartData}>
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
              <Line type="monotone" dataKey="interns" stroke="#10B981" strokeWidth={2} name="Interns" />
              <Line type="monotone" dataKey="applications" stroke="#F59E0B" strokeWidth={2} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Distribution Chart */}
        <ChartCard
          title="User Distribution"
          description="Breakdown of users by type"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayUserDistribution}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ type, percentage }) => `${type} (${percentage}%)`}
              >
                {displayUserDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Application Status Chart */}
        <ChartCard
          title="Application Status"
          description="Current status of internship applications"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayApplicationStats}>
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

        {/* Monthly Revenue Chart */}
        <ChartCard
          title="Monthly Revenue"
          description="Revenue trends over the past months"
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayMonthlyRevenue}>
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
                formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>Key performance indicators for user engagement</CardDescription>
              </CardHeader>
              <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayEngagementMetrics.map((metric: any, index: number) => (
                <div key={index} className="text-center p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.metric}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                  <p className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
      </motion.div>

      {/* Data Status Warning */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 font-medium mb-1">Using Sample Data</p>
              <p className="text-amber-700 text-sm">
                Analytics data is currently showing sample information. Check your database connection for real-time data.
              </p>
                </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
