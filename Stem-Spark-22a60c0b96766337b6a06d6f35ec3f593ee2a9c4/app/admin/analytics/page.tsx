"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts'
import { Users, TrendingUp, Briefcase, Mail, DollarSign, Eye, Download, Calendar, Target, Award, Activity, BarChart3, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { getAnalyticsData } from '../actions'

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
      
      const result = await getAnalyticsData()
      
      if (result.error) {
        setError(result.error)
        // Use sample data for demo
        setAnalyticsData(sampleAnalyticsData)
      } else if (result.data) {
        setAnalyticsData(result.data)
      } else {
        // Use sample data if no real data
        setAnalyticsData(sampleAnalyticsData)
      }
    } catch (err) {
      setError('Failed to load analytics')
      setAnalyticsData(sampleAnalyticsData)
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
    <motion.div 
      className="space-y-8 p-2 sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">
              Analytics & Reports
            </h1>
            <p className="text-lg text-gray-600 mt-1">
              Comprehensive insights into platform performance and user engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button 
              onClick={fetchAnalytics}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button className="bg-[var(--novakinetix-primary)] hover:bg-[var(--novakinetix-accent)]">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
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
          title="Active Internships"
          value={analyticsData?.activeInternships || '0'}
          change="+8%"
          icon={Briefcase}
          color="bg-purple-500"
        />
        <MetricCard
          title="Applications"
          value={analyticsData?.totalApplications || '0'}
          change="+15%"
          icon={Mail}
          color="bg-amber-500"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(analyticsData?.monthlyRevenue?.[analyticsData.monthlyRevenue.length - 1]?.revenue || 0).toLocaleString()}`}
          change="+23%"
          icon={DollarSign}
          color="bg-emerald-500"
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* User Growth Chart */}
        <ChartCard
          title="Platform Growth"
          description="Monthly trends for users, interns, and applications"
        >
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  name="Users" 
                  stackId="1"
                  stroke="var(--novakinetix-primary)" 
                  fill="var(--novakinetix-primary)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="interns" 
                  name="Interns" 
                  stackId="1"
                  stroke="var(--novakinetix-accent)" 
                  fill="var(--novakinetix-accent)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  name="Applications" 
                  stackId="1"
                  stroke="#10B981" 
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Application Status Chart */}
        <ChartCard
          title="Application Status"
          description="Distribution of internship applications by status"
        >
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayApplicationStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(displayApplicationStats || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {(displayApplicationStats || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700 capitalize">{item.status}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Additional Charts */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* Revenue Chart */}
        <ChartCard
          title="Monthly Revenue"
          description="Revenue trends over the past 7 months"
        >
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayMonthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="var(--novakinetix-primary)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* User Types Chart */}
        <ChartCard
          title="User Distribution"
          description="Breakdown of users by type"
        >
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayUserDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {(displayUserDistribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {(displayUserDistribution || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700">{item.type}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Engagement Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ChartCard
          title="Engagement Metrics"
          description="Key performance indicators for user engagement"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(displayEngagementMetrics || []).map((metric: any, index: number) => (
              <motion.div
                key={metric.metric}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="shadow-md hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-600 mb-2">{metric.metric}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className={`text-sm font-medium ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </motion.div>
    </motion.div>
  )
}
