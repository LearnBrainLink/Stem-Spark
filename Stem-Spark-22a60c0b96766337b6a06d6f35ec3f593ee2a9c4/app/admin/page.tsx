"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import { Users, Briefcase, Mail, DollarSign, TrendingUp, Shield, AlertCircle, CheckCircle, Clock, UserCheck, BarChart3, Download, FileText, RefreshCw, Activity, GraduationCap, Video } from "lucide-react";
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
} from "@/components/ui/alert";
import {
  Label,
} from "@/components/ui/label";

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
}

const StatCard = ({ title, value, icon: Icon, description, color, bgColor, delay = 0, trend, trendValue }: StatCardProps) => {
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
          <motion.div 
            className={`p-2 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-200`}
            whileHover={{ rotate: 5 }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </motion.div>
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

// Sample data removed - now using real database data

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    students: number;
    teachers: number;
    parents: number;
    admins: number;
    activeInternships: number;
    totalInternships: number;
    pendingApplications: number;
    totalApplications: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    totalVideos: number;
    activeVideos: number;
    totalVolunteerHours: number;
    pendingHours: number;
    totalApprovedHours: number;
    recentActivity: any[];
    userGrowthChart: any[];
    userDistributionData: any[];
    volunteerHoursChart: any[];
    activityTrendsChart: any[];
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
        
        console.log('🔄 Fetching real dashboard stats from database...');
        
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const realStats = await response.json();
        
        setStats({
          totalUsers: realStats.totalUsers,
          students: realStats.students,
          teachers: realStats.teachers,
          parents: realStats.parents,
          admins: realStats.admins,
          activeInternships: realStats.activeInternships,
          totalInternships: realStats.totalInternships,
          pendingApplications: realStats.pendingApplications,
          totalApplications: realStats.totalApplications,
          totalRevenue: realStats.totalRevenue,
          thisMonthRevenue: realStats.thisMonthRevenue,
          totalVideos: realStats.totalVideos,
          activeVideos: realStats.activeVideos,
          totalVolunteerHours: realStats.totalVolunteerHours,
          pendingHours: realStats.pendingHours,
          totalApprovedHours: realStats.totalApprovedHours,
          recentActivity: realStats.recentActivity,
          userGrowthChart: realStats.userGrowthChart,
          userDistributionData: realStats.userDistributionData,
          volunteerHoursChart: realStats.volunteerHoursChart,
          activityTrendsChart: realStats.activityTrendsChart
        });
        
        setConnectionStatus('connected');
        setIsSampleData(false);
        setIsLoading(false);
        console.log('✅ Real database stats loaded successfully');
        
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setConnectionStatus('error');
        console.error('💥 Error fetching real stats:', err);
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      // Simulate report generation
      setTimeout(() => {
        setReportData({
          summary: 'Comprehensive platform report generated successfully with all key metrics and analytics.',
          data: stats
        });
        setMessage({ type: "success", text: `Report generated successfully!` });
        setIsGeneratingReport(false);
      }, 2000);
      
    } catch (err) {
      setError('Failed to generate report');
      setIsGeneratingReport(false);
    }
  };

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

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of platform statistics and recent activity</p>
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
                      <SelectItem value="internship-stats">Internship Statistics</SelectItem>
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

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
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
            title="Teachers"
            value={stats?.teachers?.toLocaleString() || "0"}
            icon={Shield}
            description="Active teachers"
            color="text-purple-600"
            bgColor="bg-purple-100"
            delay={0.3}
            trend="+5%"
            trendValue="this month"
          />
          <StatCard
            title="Parents"
            value={stats?.parents?.toLocaleString() || "0"}
            icon={UserCheck}
            description="Registered parents"
            color="text-orange-600"
            bgColor="bg-orange-100"
            delay={0.4}
            trend="+15%"
            trendValue="this month"
          />
          <StatCard
            title="Active Internships"
            value={stats?.activeInternships?.toLocaleString() || "0"}
            icon={Briefcase}
            description="Current programs"
            color="text-indigo-600"
            bgColor="bg-indigo-100"
            delay={0.5}
            trend="+3"
            trendValue="new this week"
          />
          <StatCard
            title="Pending Applications"
            value={stats?.pendingApplications?.toLocaleString() || "0"}
            icon={Clock}
            description="Awaiting review"
            color="text-yellow-600"
            bgColor="bg-yellow-100"
            delay={0.6}
            trend="+7"
            trendValue="new today"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats?.totalRevenue?.toLocaleString() || "0"}`}
            icon={DollarSign}
            description="Platform revenue"
            color="text-emerald-600"
            bgColor="bg-emerald-100"
            delay={0.7}
            trend="+18%"
            trendValue="this month"
          />
          <StatCard
            title="Total Videos"
            value={stats?.totalVideos?.toLocaleString() || "0"}
            icon={Video}
            description="Educational content"
            color="text-red-600"
            bgColor="bg-red-100"
            delay={0.8}
            trend="+12"
            trendValue="new this week"
          />
          <StatCard
            title="Volunteer Hours"
            value={stats?.totalApprovedHours?.toLocaleString() || "0"}
            icon={Activity}
            description="Total approved hours"
            color="text-teal-600"
            bgColor="bg-teal-100"
            delay={0.9}
            trend="+25"
            trendValue="this week"
          />
          <StatCard
            title="Pending Hours"
            value={stats?.pendingHours?.toLocaleString() || "0"}
            icon={Clock}
            description="Awaiting approval"
            color="text-amber-600"
            bgColor="bg-amber-100"
            delay={1.0}
            trend="+5"
            trendValue="new today"
          />
        </div>
      )}

      {/* Charts Section */}
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
                <LineChart data={stats?.userGrowthChart || []}>
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
                    data={stats?.userDistributionData || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.userDistributionData || []).map((entry: any, index: number) => (
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

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Volunteer Hours Trend Chart */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Volunteer Hours Trends</CardTitle>
            <CardDescription>Monthly volunteer hours by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.volunteerHoursChart || []}>
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
                  <Bar dataKey="approved" fill="#10b981" name="Approved Hours" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Trends Chart */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Platform Activity</CardTitle>
            <CardDescription>Daily user activity trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.activityTrendsChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

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