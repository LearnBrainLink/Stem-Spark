'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Users, 
  Clock, 
  MessageSquare, 
  BookOpen,
  Download,
  RefreshCw,
  AlertCircle,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  overview: {
    total_users: number;
    new_users: number;
    active_users: number;
    total_volunteer_hours: number;
    pending_volunteer_hours: number;
    total_tutoring_sessions: number;
    completed_tutoring_sessions: number;
    total_messages: number;
    active_channels: number;
  };
  trends: {
    user_growth: any[];
    volunteer_hours: any[];
    messaging_activity: any[];
  };
  engagement: {
    user_retention_rate: number;
    avg_session_duration: number;
    message_engagement: number;
    volunteer_participation_rate: number;
  };
  conversions: {
    volunteer_hours_approval_rate: number;
    tutoring_completion_rate: number;
    user_activation_rate: number;
  };
  top_events: any[];
  time_range: string;
}

export default function AnalyticsDashboardPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/dashboard?time_range=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string, format: string = 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?type=${type}&time_range=${timeRange}&format=${format}`);
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  const getMetricColor = (value: number, threshold: number = 50) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and data analysis</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
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
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => exportData('comprehensive')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.total_users)}</div>
            <p className="text-xs text-muted-foreground">
              +{formatNumber(analyticsData.overview.new_users)} new this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.total_volunteer_hours)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.overview.pending_volunteer_hours)} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tutoring Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.total_tutoring_sessions)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.overview.completed_tutoring_sessions)} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.total_messages)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(analyticsData.overview.active_channels)} active channels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trends.user_growth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Volunteer Hours Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Hours</CardTitle>
                <CardDescription>Approved volunteer hours over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trends.volunteer_hours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messaging Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Messaging Activity</CardTitle>
                <CardDescription>Message volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.messaging_activity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top User Events</CardTitle>
                <CardDescription>Most common user activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.top_events.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{event.event_type}</span>
                      <Badge variant="secondary">{event.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User engagement and participation rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Retention Rate</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.engagement.user_retention_rate)}`}>
                      {formatPercentage(analyticsData.engagement.user_retention_rate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Session Duration</span>
                    <span className="text-lg font-bold">{analyticsData.engagement.avg_session_duration.toFixed(1)}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Message Engagement</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.engagement.message_engagement)}`}>
                      {formatPercentage(analyticsData.engagement.message_engagement)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volunteer Participation</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.engagement.volunteer_participation_rate)}`}>
                      {formatPercentage(analyticsData.engagement.volunteer_participation_rate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Success rates for key activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volunteer Hours Approval</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.conversions.volunteer_hours_approval_rate)}`}>
                      {formatPercentage(analyticsData.conversions.volunteer_hours_approval_rate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tutoring Completion</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.conversions.tutoring_completion_rate)}`}>
                      {formatPercentage(analyticsData.conversions.tutoring_completion_rate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">User Activation</span>
                    <span className={`text-lg font-bold ${getMetricColor(analyticsData.conversions.user_activation_rate)}`}>
                      {formatPercentage(analyticsData.conversions.user_activation_rate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Export</CardTitle>
              <CardDescription>Export analytics data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => exportData('user_analytics')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Users className="w-6 h-6" />
                  <span>User Analytics</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData('volunteer_hours')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <Clock className="w-6 h-6" />
                  <span>Volunteer Hours</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData('tutoring_sessions')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <BookOpen className="w-6 h-6" />
                  <span>Tutoring Sessions</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => exportData('messaging_analytics')}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                >
                  <MessageSquare className="w-6 h-6" />
                  <span>Messaging Analytics</span>
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Export Options</h3>
                <div className="flex gap-4">
                  <Button onClick={() => exportData('comprehensive', 'json')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data (JSON)
                  </Button>
                  <Button onClick={() => exportData('comprehensive', 'csv')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data (CSV)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 