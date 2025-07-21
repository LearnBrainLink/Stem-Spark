'use client';

import { useState, useEffect } from 'react';
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

const sampleUserGrowthData = [
  { month: 'Jan', users: 120, interns: 45, admins: 8 },
  { month: 'Feb', users: 180, interns: 62, admins: 10 },
  { month: 'Mar', users: 250, interns: 78, admins: 12 },
  { month: 'Apr', users: 320, interns: 95, admins: 15 },
  { month: 'May', users: 410, interns: 120, admins: 18 },
  { month: 'Jun', users: 520, interns: 145, admins: 20 },
  { month: 'Jul', users: 650, interns: 180, admins: 25 },
];

const sampleVolunteerHoursData = [
  { month: 'Jan', submitted: 45, approved: 42, pending: 3 },
  { month: 'Feb', submitted: 62, approved: 58, pending: 4 },
  { month: 'Mar', submitted: 78, approved: 72, pending: 6 },
  { month: 'Apr', submitted: 95, approved: 88, pending: 7 },
  { month: 'May', submitted: 120, approved: 110, pending: 10 },
  { month: 'Jun', submitted: 145, approved: 135, pending: 10 },
  { month: 'Jul', submitted: 180, approved: 165, pending: 15 },
];

const sampleMessagingData = [
  { month: 'Jan', messages: 1200, channels: 8, activeUsers: 45 },
  { month: 'Feb', messages: 1800, channels: 12, activeUsers: 62 },
  { month: 'Mar', messages: 2500, channels: 15, activeUsers: 78 },
  { month: 'Apr', messages: 3200, channels: 18, activeUsers: 95 },
  { month: 'May', messages: 4100, channels: 22, activeUsers: 120 },
  { month: 'Jun', messages: 5200, channels: 25, activeUsers: 145 },
  { month: 'Jul', messages: 6500, channels: 30, activeUsers: 180 },
];

const userDistributionData = [
  { name: 'Students', value: 65, color: '#3B82F6' },
  { name: 'Interns', value: 25, color: '#10B981' },
  { name: 'Admins', value: 10, color: '#8B5CF6' },
];

const volunteerHoursDistribution = [
  { name: 'Tutoring', value: 45, color: '#3B82F6' },
  { name: 'Event Planning', value: 25, color: '#10B981' },
  { name: 'Content Creation', value: 20, color: '#F59E0B' },
  { name: 'Administrative', value: 10, color: '#EF4444' },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('6months');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch data based on timeRange
      // For now, we'll use sample data
      setTimeout(() => {
        setStats({
          totalUsers: 650,
          totalInterns: 180,
          totalAdmins: 25,
          totalVolunteerHours: 1650,
          pendingHours: 15,
          activeChannels: 30,
          totalMessages: 6500,
          avgResponseTime: '2.3 hours'
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setIsLoading(false);
    }
  };

  const downloadReport = (type: string) => {
    const data = {
      type,
      generatedAt: new Date().toISOString(),
      timeRange,
      stats
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${type}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={fetchAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVolunteerHours || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeChannels || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgResponseTime || '0'}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-10%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer Hours</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>Monthly user registration and growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleUserGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
                      <Area type="monotone" dataKey="interns" stackId="1" stroke="#10B981" fill="#10B981" />
                      <Area type="monotone" dataKey="admins" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by user type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volunteer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours Trend</CardTitle>
                <CardDescription>Monthly volunteer hours submitted and approved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sampleVolunteerHoursData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="submitted" fill="#3B82F6" />
                      <Bar dataKey="approved" fill="#10B981" />
                      <Bar dataKey="pending" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours by Activity</CardTitle>
                <CardDescription>Distribution of volunteer hours by activity type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={volunteerHoursDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {volunteerHoursDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Messaging Activity</CardTitle>
                <CardDescription>Monthly message volume and channel growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleMessagingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} />
                      <Line type="monotone" dataKey="channels" stroke="#10B981" strokeWidth={2} />
                      <Line type="monotone" dataKey="activeUsers" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Messaging Metrics</CardTitle>
                <CardDescription>Key messaging platform statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Total Messages</p>
                        <p className="text-sm text-blue-700">{stats?.totalMessages || 0} messages</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Active Users</p>
                        <p className="text-sm text-green-700">180 users this month</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold text-purple-900">Engagement Rate</p>
                        <p className="text-sm text-purple-700">85% active participation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>User distribution by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">United States</span>
                    <Badge variant="secondary">65%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Canada</span>
                    <Badge variant="secondary">15%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">United Kingdom</span>
                    <Badge variant="secondary">10%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Other</span>
                    <Badge variant="secondary">10%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Usage</CardTitle>
                <CardDescription>User activity by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Web Browser</span>
                    <Badge variant="secondary">70%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Mobile App</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tablet</span>
                    <Badge variant="secondary">5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Download comprehensive analytics reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => downloadReport('user-analytics')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="w-6 h-6" />
              <span>User Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadReport('volunteer-hours')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Clock className="w-6 h-6" />
              <span>Volunteer Hours</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadReport('messaging-analytics')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Messaging Analytics</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => downloadReport('comprehensive')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="w-6 h-6" />
              <span>Comprehensive</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 