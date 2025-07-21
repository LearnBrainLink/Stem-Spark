"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, Mail, DollarSign, TrendingUp, Shield, AlertCircle, CheckCircle, Clock, Award, Target, Zap, UserCheck, BarChart3, Download, FileText, RefreshCw, Activity, GraduationCap, Video, MessageSquare, Settings, Eye, UserPlus, Calendar, Bell } from "lucide-react";
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Label,
} from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  color: string;
  bgColor: string;
  delay?: number;
  trend?: string;
  trendValue?: string;
  badge?: number;
}

const StatCard = ({ title, value, icon: Icon, description, color, bgColor, delay = 0, trend, trendValue, badge }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, scale: 1.02 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden group h-full">
        <div className={`absolute top-0 left-0 w-full h-1 ${bgColor.replace('bg-', 'bg-gradient-to-r from-')} opacity-80`}></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {badge && badge > 0 && (
              <Badge variant="destructive" className="text-xs">
                {badge}
              </Badge>
            )}
            <motion.div 
              className={`p-2 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-200`}
              whileHover={{ rotate: 5 }}
            >
              <Icon className={`w-5 h-5 ${color}`} />
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <motion.div 
            className="text-2xl font-bold text-gray-900 mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          <p className="text-xs text-gray-600 mb-2">{description}</p>
          {trend && (
            <div className={`flex items-center text-xs ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend} {trendValue}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const StatCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  </motion.div>
);

const sampleChartData = [
  { name: 'Jan', users: 4200, interns: 2400, applications: 1800, volunteerHours: 1200 },
  { name: 'Feb', users: 3800, interns: 1398, applications: 2200, volunteerHours: 1400 },
  { name: 'Mar', users: 5200, interns: 9800, applications: 3400, volunteerHours: 1800 },
  { name: 'Apr', users: 4780, interns: 3908, applications: 2800, volunteerHours: 1600 },
  { name: 'May', users: 5890, interns: 4800, applications: 4200, volunteerHours: 2200 },
  { name: 'Jun', users: 6390, interns: 3800, applications: 3800, volunteerHours: 2000 },
  { name: 'Jul', users: 7490, interns: 4300, applications: 5200, volunteerHours: 2400 },
];

const samplePieData = [
  { name: 'Students', value: 65, color: '#3B82F6' },
  { name: 'Admins', value: 20, color: '#8B5CF6' },
  { name: 'Interns', value: 15, color: '#10B981' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    students: number;
    admins: number;
    interns: number;
    activeInternships: number;
    totalInternships: number;
    pendingApplications: number;
    totalApplications: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    totalVideos: number;
    activeVideos: number;
    pendingVolunteerHours: number;
    totalVolunteerHours: number;
    activeChannels: number;
    totalMessages: number;
    recentActivity: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('comprehensive');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        setConnectionStatus('loading');
        
        console.log('🔄 Fetching enhanced dashboard stats...');
        
        // Fetch basic stats
        const [usersResponse, volunteerHoursResponse, applicationsResponse, videosResponse, channelsResponse] = await Promise.all([
          fetch('/api/admin/stats/users'),
          fetch('/api/admin/stats/volunteer-hours'),
          fetch('/api/admin/stats/applications'),
          fetch('/api/admin/stats/videos'),
          fetch('/api/admin/stats/messaging')
        ]);

        const usersData = await usersResponse.json();
        const volunteerHoursData = await volunteerHoursResponse.json();
        const applicationsData = await applicationsResponse.json();
        const videosData = await videosResponse.json();
        const channelsData = await channelsResponse.json();

        const combinedStats = {
          totalUsers: usersData.totalUsers || 0,
          students: usersData.students || 0,
          admins: usersData.admins || 0,
          interns: usersData.interns || 0,
          activeInternships: applicationsData.activeInternships || 0,
          totalInternships: applicationsData.totalInternships || 0,
          pendingApplications: applicationsData.pendingApplications || 0,
          totalApplications: applicationsData.totalApplications || 0,
          totalRevenue: applicationsData.totalRevenue || 0,
          thisMonthRevenue: applicationsData.thisMonthRevenue || 0,
          totalVideos: videosData.totalVideos || 0,
          activeVideos: videosData.activeVideos || 0,
          pendingVolunteerHours: volunteerHoursData.pendingHours || 0,
          totalVolunteerHours: volunteerHoursData.totalHours || 0,
          activeChannels: channelsData.activeChannels || 0,
          totalMessages: channelsData.totalMessages || 0,
          recentActivity: []
        };

        setStats(combinedStats);
        setConnectionStatus('connected');
        
        // Check if this is real data (not all zeros)
        const hasRealData = Object.values(combinedStats).some(value => 
          typeof value === 'number' ? value > 0 : Array.isArray(value) ? value.length > 0 : false
        );
        setIsSampleData(!hasRealData);
        
        console.log('✅ Enhanced dashboard stats loaded:', combinedStats);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setConnectionStatus('error');
        console.error('💥 Error fetching stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: selectedReportType }),
      });
      
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else if (result.report) {
        setReportData(result.report);
        setMessage({ type: "success", text: `Report generated successfully!` });
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const numberFormatter = new Intl.NumberFormat('en-US');
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const statsData = stats ? [
    {
      title: "Total Users",
      value: numberFormatter.format(stats.totalUsers),
      icon: Users,
      description: isSampleData ? "Database connection issue" : "Active user accounts",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "+12%",
      trendValue: "this month"
    },
    {
      title: "Pending Hours",
      value: numberFormatter.format(stats.pendingVolunteerHours),
      icon: Clock,
      description: isSampleData ? "Database connection issue" : "Awaiting approval",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      badge: stats.pendingVolunteerHours,
      trend: "+5",
      trendValue: "new today"
    },
    {
      title: "Active Channels",
      value: numberFormatter.format(stats.activeChannels),
      icon: MessageSquare,
      description: isSampleData ? "Database connection issue" : "Real-time messaging",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: "+2",
      trendValue: "new this week"
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(stats.totalRevenue),
      icon: DollarSign,
      description: isSampleData ? "Database connection issue" : "Year-to-date earnings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      trend: "+23%",
      trendValue: "this month"
    },
  ] : [];

  const downloadReport = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayChartData = sampleChartData;

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive overview of platform statistics and new features</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Report</DialogTitle>
                <DialogDescription>
                  Create a comprehensive report of platform data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Type</Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                      <SelectItem value="user-analytics">User Analytics</SelectItem>
                      <SelectItem value="volunteer-hours">Volunteer Hours Report</SelectItem>
                      <SelectItem value="messaging-analytics">Messaging Analytics</SelectItem>
                      <SelectItem value="financial-summary">Financial Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleGenerateReport} 
                    disabled={isGeneratingReport}
                    className="flex-1"
                  >
                    {isGeneratingReport ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsReportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus === 'loading' && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>Connecting to database...</AlertDescription>
        </Alert>
      )}

      {connectionStatus === 'error' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Unable to connect to database. Showing sample data.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button asChild className="h-auto p-4 flex flex-col items-center gap-2">
          <Link href="/admin/volunteer-hours">
            <Clock className="w-6 h-6" />
            <span>Review Hours</span>
            {stats?.pendingVolunteerHours > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.pendingVolunteerHours}
              </Badge>
            )}
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <Link href="/communication-hub">
            <MessageSquare className="w-6 h-6" />
            <span>Messaging</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <Link href="/admin/protection">
            <Shield className="w-6 h-6" />
            <span>Admin Protection</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <Link href="/admin/analytics">
            <BarChart3 className="w-6 h-6" />
            <span>Analytics</span>
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <StatCardSkeleton key={index} delay={index * 0.1} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers?.toLocaleString() || "0"}
            icon={Users}
            description="Registered users"
            color="text-blue-600"
            bgColor="bg-blue-100"
            delay={0.1}
            trend="+12%"
            trendValue="this month"
          />
          <StatCard
            title="Students"
            value={stats?.students?.toLocaleString() || "0"}
            icon={GraduationCap}
            description="Active students"
            color="text-green-600"
            bgColor="bg-green-100"
            delay={0.2}
            trend="+8%"
            trendValue="this month"
          />
          <StatCard
            title="Admins"
            value={stats?.admins?.toLocaleString() || "0"}
            icon={Shield}
            description="Administrative users"
            color="text-purple-600"
            bgColor="bg-purple-100"
            delay={0.3}
            trend="+5%"
            trendValue="this month"
          />
          <StatCard
            title="Interns"
            value={stats?.interns?.toLocaleString() || "0"}
            icon={UserCheck}
            description="Active interns"
            color="text-orange-600"
            bgColor="bg-orange-100"
            delay={0.4}
            trend="+15%"
            trendValue="this month"
          />
          <StatCard
            title="Pending Hours"
            value={stats?.pendingVolunteerHours?.toLocaleString() || "0"}
            icon={Clock}
            description="Awaiting approval"
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            delay={0.5}
            badge={stats?.pendingVolunteerHours}
            trend="+7"
            trendValue="new today"
          />
          <StatCard
            title="Total Hours"
            value={stats?.totalVolunteerHours?.toLocaleString() || "0"}
            icon={Award}
            description="Approved volunteer hours"
            color="text-emerald-600"
            bgColor="bg-emerald-100"
            delay={0.6}
            trend="+18%"
            trendValue="this month"
          />
          <StatCard
            title="Active Channels"
            value={stats?.activeChannels?.toLocaleString() || "0"}
            icon={MessageSquare}
            description="Real-time messaging"
            color="text-indigo-600"
            bgColor="bg-indigo-100"
            delay={0.7}
            trend="+3"
            trendValue="new this week"
          />
          <StatCard
            title="Total Messages"
            value={stats?.totalMessages?.toLocaleString() || "0"}
            icon={Bell}
            description="Platform communications"
            color="text-red-600"
            bgColor="bg-red-100"
            delay={0.8}
            trend="+25%"
            trendValue="this month"
          />
        </div>
      )}

      {/* Enhanced Charts Section */}
      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer Hours</TabsTrigger>
          <TabsTrigger value="messaging">Messaging Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="interns" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Distribution Chart */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">User Distribution</CardTitle>
                <CardDescription>Breakdown by user type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={samplePieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {samplePieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volunteer" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volunteer Hours Chart */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Volunteer Hours Trend</CardTitle>
                <CardDescription>Monthly volunteer hours submitted and approved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="volunteerHours" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Volunteer Hours Summary */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Volunteer Hours Summary</CardTitle>
                <CardDescription>Current volunteer hours statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Approved Hours</p>
                        <p className="text-sm text-green-700">{stats?.totalVolunteerHours || 0} total hours</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-yellow-900">Pending Review</p>
                        <p className="text-sm text-yellow-700">{stats?.pendingVolunteerHours || 0} submissions</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/admin/volunteer-hours">
                      <Eye className="w-4 h-4 mr-2" />
                      Review All Hours
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="messaging" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messaging Activity Chart */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Messaging Activity</CardTitle>
                <CardDescription>Monthly message volume and channel activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displayChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }} 
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="applications" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                        name="Messages"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Summary */}
            <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Messaging Summary</CardTitle>
                <CardDescription>Current messaging platform statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="font-semibold text-purple-900">Active Channels</p>
                        <p className="text-sm text-purple-700">{stats?.activeChannels || 0} channels</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-900">Total Messages</p>
                        <p className="text-sm text-blue-700">{stats?.totalMessages || 0} messages</p>
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/communication-hub">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Open Messaging Hub
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          <CardDescription>Latest platform activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Generated Report</CardTitle>
            <CardDescription>Report results and download options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Report generated successfully!</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  {reportData.summary}
                </p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => downloadReport(reportData)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" onClick={() => setReportData(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 