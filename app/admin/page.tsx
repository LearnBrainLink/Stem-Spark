'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { 
  Users, 
  FileText, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DashboardStats {
  totalUsers: number
  totalApplications: number
  pendingApplications: number
  totalMessages: number
  totalVolunteerHours: number
  pendingVolunteerHours: number
  recentActivity: any[]
  userGrowthData: any[]
  applicationStats: any[]
  messageStats: any[]
  volunteerHoursStats: any[]
  userDistribution: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalMessages: 0,
    totalVolunteerHours: 0,
    pendingVolunteerHours: 0,
    recentActivity: [],
    userGrowthData: [],
    applicationStats: [],
    messageStats: [],
    volunteerHoursStats: [],
    userDistribution: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch user stats
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch application stats
      const { count: appCount } = await supabase
        .from('intern_applications')
        .select('*', { count: 'exact', head: true })

      const { count: pendingCount } = await supabase
        .from('intern_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch message stats
      const { count: messageCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })

      // Fetch volunteer hours stats
      const { count: volunteerHoursCount } = await supabase
        .from('volunteer_hours')
        .select('*', { count: 'exact', head: true })

      const { count: pendingHoursCount } = await supabase
        .from('volunteer_hours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Fetch recent applications
      const { data: recentApplications } = await supabase
        .from('intern_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch user growth data (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: userGrowth } = await supabase
        .from('profiles')
        .select('created_at, role')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      // Fetch application stats by month
      const { data: applicationStats } = await supabase
        .from('intern_applications')
        .select('created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      // Fetch message stats by month
      const { data: messageStats } = await supabase
        .from('chat_messages')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      // Fetch volunteer hours stats by month
      const { data: volunteerHoursStats } = await supabase
        .from('volunteer_hours')
        .select('created_at, hours, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

      // Process user growth data
      const userGrowthData = processTimeSeriesData(userGrowth, 'created_at', 'users')
      
      // Process application stats
      const applicationStatsData = processTimeSeriesData(applicationStats, 'created_at', 'applications')
      
      // Process message stats
      const messageStatsData = processTimeSeriesData(messageStats, 'created_at', 'messages')
      
      // Process volunteer hours stats
      const volunteerHoursData = processTimeSeriesData(volunteerHoursStats, 'created_at', 'hours')

      // Calculate user distribution
      const userDistribution = calculateUserDistribution(userGrowth)

      setStats({
        totalUsers: userCount || 0,
        totalApplications: appCount || 0,
        pendingApplications: pendingCount || 0,
        totalMessages: messageCount || 0,
        totalVolunteerHours: volunteerHoursCount || 0,
        pendingVolunteerHours: pendingHoursCount || 0,
        recentActivity: recentApplications || [],
        userGrowthData,
        applicationStats: applicationStatsData,
        messageStats: messageStatsData,
        volunteerHoursStats: volunteerHoursData,
        userDistribution
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTimeSeriesData = (data: any[], dateField: string, valueField: string) => {
    if (!data || data.length === 0) return []

    const monthlyData: { [key: string]: number } = {}
    
    data.forEach(item => {
      const date = new Date(item[dateField])
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (valueField === 'hours') {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (item.hours || 0)
      } else {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
      }
    })

    return Object.entries(monthlyData).map(([month, value]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      [valueField]: value
    }))
  }

  const calculateUserDistribution = (users: any[]) => {
    if (!users || users.length === 0) return []

    const distribution: { [key: string]: number } = {}
    users.forEach(user => {
      distribution[user.role] = (distribution[user.role] || 0) + 1
    })

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    
    return Object.entries(distribution).map(([role, count], index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
      color: colors[index % colors.length]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to NovaKinetix Academy Administration</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteerHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingVolunteerHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Application Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Application Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.applicationStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Message Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Message Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.messageStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="messages" stroke="#8B5CF6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/applications" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Review Applications</h3>
                  <p className="text-gray-600">Approve or reject intern applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                  <p className="text-gray-600">View and manage user accounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/messaging" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Admin Messaging</h3>
                  <p className="text-gray-600">Manage all communication channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/volunteer-hours" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Award className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Volunteer Hours</h3>
                  <p className="text-gray-600">Review and approve volunteer hours</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                  <p className="text-gray-600">Detailed analytics and reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/communication-hub" className="block">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Communication Hub</h3>
                  <p className="text-gray-600">Access the main communication hub</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((application: any) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{application.full_name}</h4>
                    <p className="text-sm text-gray-600">{application.applicant_email}</p>
                    <p className="text-xs text-gray-500">Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={
                    application.status === 'pending' ? 'secondary' :
                    application.status === 'approved' ? 'default' :
                    'destructive'
                  }>
                    {application.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent applications</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 