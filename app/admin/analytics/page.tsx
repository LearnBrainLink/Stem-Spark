'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  MessageSquare, 
  Award, 
  Calendar, 
  Download, 
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [volunteerHoursData, setVolunteerHoursData] = useState<any[]>([]);
  const [messagingData, setMessagingData] = useState<any[]>([]);
  const [userDistributionData, setUserDistributionData] = useState<any[]>([]);
  const [volunteerHoursDistribution, setVolunteerHoursDistribution] = useState<any[]>([]);
  const [applicationStats, setApplicationStats] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const monthsToFetch = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsToFetch);

      // Fetch user growth data
      const { data: userData } = await supabase
        .from('profiles')
        .select('created_at, role')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch volunteer hours data
      const { data: volunteerData } = await supabase
        .from('volunteer_hours')
        .select('created_at, hours, status, activity_type')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch messaging data
      const { data: messageData } = await supabase
        .from('chat_messages')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch channel data
      const { data: channelData } = await supabase
        .from('chat_channels')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Fetch application data
      const { data: applicationData } = await supabase
        .from('intern_applications')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Process user growth data
      const processedUserData = processTimeSeriesData(userData, 'created_at', 'users');
      setUserGrowthData(processedUserData);

      // Process volunteer hours data
      const processedVolunteerData = processTimeSeriesData(volunteerData, 'created_at', 'hours');
      setVolunteerHoursData(processedVolunteerData);

      // Process messaging data
      const processedMessageData = processTimeSeriesData(messageData, 'created_at', 'messages');
      setMessagingData(processedMessageData);

      // Process application data
      const processedApplicationData = processTimeSeriesData(applicationData, 'created_at', 'applications');
      setApplicationStats(processedApplicationData);

      // Calculate user distribution
      const userDistribution = calculateUserDistribution(userData);
      setUserDistributionData(userDistribution);

      // Calculate volunteer hours distribution by activity type
      const volunteerDistribution = calculateVolunteerHoursDistribution(volunteerData);
      setVolunteerHoursDistribution(volunteerDistribution);

      // Calculate overall stats
      const totalUsers = userData?.length || 0;
      const totalInterns = userData?.filter(u => u.role === 'intern').length || 0;
      const totalAdmins = userData?.filter(u => u.role === 'admin' || u.role === 'super_admin').length || 0;
      const totalVolunteerHours = volunteerData?.reduce((sum, v) => sum + (v.hours || 0), 0) || 0;
      const pendingHours = volunteerData?.filter(v => v.status === 'pending').length || 0;
      const activeChannels = channelData?.length || 0;
      const totalMessages = messageData?.length || 0;

      setStats({
        totalUsers,
        totalInterns,
        totalAdmins,
        totalVolunteerHours,
        pendingHours,
        activeChannels,
        totalMessages,
        avgResponseTime: '2.3 hours' // This would need to be calculated from actual response times
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processTimeSeriesData = (data: any[], dateField: string, valueField: string) => {
    if (!data || data.length === 0) return [];

    const monthlyData: { [key: string]: number } = {};
    
    data.forEach(item => {
      const date = new Date(item[dateField]);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (valueField === 'hours') {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (item.hours || 0);
      } else {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      }
    });

    return Object.entries(monthlyData).map(([month, value]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      [valueField]: value
    }));
  };

  const calculateUserDistribution = (users: any[]) => {
    if (!users || users.length === 0) return [];

    const distribution: { [key: string]: number } = {};
    users.forEach(user => {
      distribution[user.role] = (distribution[user.role] || 0) + 1;
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    
    return Object.entries(distribution).map(([role, count], index) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const calculateVolunteerHoursDistribution = (volunteerData: any[]) => {
    if (!volunteerData || volunteerData.length === 0) return [];

    const distribution: { [key: string]: number } = {};
    volunteerData.forEach(volunteer => {
      distribution[volunteer.activity_type] = (distribution[volunteer.activity_type] || 0) + (volunteer.hours || 0);
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    return Object.entries(distribution).map(([activity, hours], index) => ({
      name: activity.charAt(0).toUpperCase() + activity.slice(1).replace('_', ' '),
      value: hours,
      color: colors[index % colors.length]
    }));
  };

  const exportData = () => {
    // In a real implementation, this would export the data to CSV/Excel
    alert('Export functionality would be implemented here');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into NovaKinetix Academy performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
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
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Interns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInterns}</p>
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
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Volunteer Hours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalVolunteerHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer Hours</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
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

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by user roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>Detailed user registration analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours Trends</CardTitle>
                <CardDescription>Monthly volunteer hours contribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={volunteerHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="hours" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Volunteer hours by activity type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={volunteerHoursDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {volunteerHoursDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messaging Activity</CardTitle>
              <CardDescription>Message volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={messagingData}>
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
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>Intern application submissions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 