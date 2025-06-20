"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Briefcase, Mail, DollarSign, TrendingUp, Shield, AlertCircle, CheckCircle, Clock, Award, Target, Zap } from "lucide-react";
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { getDashboardStats, getAnalyticsData } from './actions';
import { motion, AnimatePresence } from 'framer-motion';

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
}

const StatCard = ({ title, value, icon: Icon, description, color, bgColor, delay = 0, trend, trendValue }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
    >
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden group">
        <div className={`absolute top-0 left-0 w-full h-1 ${bgColor.replace('bg-', 'bg-gradient-to-r from-')} opacity-80`}></div>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
          <motion.div 
            className={`p-3 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}
            whileHover={{ rotate: 5 }}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-3xl font-bold text-gray-900 mb-1"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
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
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-12 rounded-xl" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-32 mb-2" />
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  </motion.div>
);

const sampleChartData = [
  { name: 'Jan', users: 4200, interns: 2400, applications: 1800 },
  { name: 'Feb', users: 3800, interns: 1398, applications: 2200 },
  { name: 'Mar', users: 5200, interns: 9800, applications: 3400 },
  { name: 'Apr', users: 4780, interns: 3908, applications: 2800 },
  { name: 'May', users: 5890, interns: 4800, applications: 4200 },
  { name: 'Jun', users: 6390, interns: 3800, applications: 3800 },
  { name: 'Jul', users: 7490, interns: 4300, applications: 5200 },
];

const samplePieData = [
  { name: 'Students', value: 65, color: '#3B82F6' },
  { name: 'Teachers', value: 20, color: '#8B5CF6' },
  { name: 'Admins', value: 15, color: '#10B981' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    users: number;
    internships: number;
    applications: number;
    revenue: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);
        setConnectionStatus('loading');
        
        console.log('🔄 Fetching dashboard stats...');
        const result = await getDashboardStats();
        
        if (result.error) {
          setError(result.error);
          setConnectionStatus('error');
          console.error('❌ Dashboard stats error:', result.error);
        } else if (result.stats) {
          setStats(result.stats);
          setConnectionStatus('connected');
          
          // Check if this is real data (not all zeros)
          const hasRealData = Object.values(result.stats).some(value => value > 0);
          setIsSampleData(!hasRealData);
          
          console.log('✅ Dashboard stats loaded:', result.stats);
        }
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

  // Fetch real chart data
  const [chartData, setChartData] = useState<any>(null);
  const [userDistribution, setUserDistribution] = useState<any>(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        const result = await getAnalyticsData();
        if (result.data) {
          setChartData(result.data.userGrowth);
          setUserDistribution(result.data.userTypes);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    }

    fetchChartData();
  }, []);

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
      value: numberFormatter.format(stats.users),
      icon: Users,
      description: isSampleData ? "Database connection issue" : "Active user accounts",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12%",
      trendValue: "this month"
    },
    {
      title: "Active Internships",
      value: numberFormatter.format(stats.internships),
      icon: Briefcase,
      description: isSampleData ? "Database connection issue" : "Available programs",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+8%",
      trendValue: "this month"
    },
    {
      title: "Applications",
      value: numberFormatter.format(stats.applications),
      icon: Mail,
      description: isSampleData ? "Database connection issue" : "Pending reviews",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "+15%",
      trendValue: "this month"
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(stats.revenue),
      icon: DollarSign,
      description: isSampleData ? "Database connection issue" : "Year-to-date earnings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+23%",
      trendValue: "this month"
    },
  ] : [];

  // Use real data for charts, fallback to sample data if needed
  const displayChartData = chartData && chartData.length > 0 ? chartData : sampleChartData;
  const displayUserDistribution = userDistribution && userDistribution.length > 0 ? userDistribution : samplePieData;

  return (
    <motion.div 
      className="space-y-8 p-2 sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)] mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Welcome back! Here's a comprehensive overview of your platform's performance and key metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {connectionStatus === 'connected' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </motion.div>
              )}
              {connectionStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Connection Error</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {isSampleData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-800 font-medium mb-1">Database Connection Issue</p>
                <p className="text-amber-700 text-sm">
                  The dashboard is showing sample data. Please check your Supabase configuration and ensure all tables exist with proper RLS policies.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.header>
      
      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {isLoading ? (
            <>
              <StatCardSkeleton delay={0.1} />
              <StatCardSkeleton delay={0.2} />
              <StatCardSkeleton delay={0.3} />
              <StatCardSkeleton delay={0.4} />
            </>
          ) : error ? (
            <motion.div 
              className="col-span-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-red-800 font-semibold text-lg">Connection Error</p>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline" 
                      className="border-red-300 text-red-700 hover:bg-red-100"
                    >
                      Retry Connection
                    </Button>
                    <Button 
                      onClick={() => window.open('/admin/setup', '_blank')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Check Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            statsData.map((stat, index) => (
              <StatCard key={stat.title} {...stat} delay={index * 0.1} />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {/* User Growth Chart */}
        <motion.div 
          className="col-span-1 lg:col-span-2"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">Platform Growth</CardTitle>
              <CardDescription className="text-gray-600">
                Monthly trends for users, interns, and applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
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
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="New Users" 
                      stroke="var(--novakinetix-primary)" 
                      strokeWidth={3} 
                      dot={{ r: 6, fill: 'var(--novakinetix-primary)' }} 
                      activeDot={{ r: 10, stroke: 'var(--novakinetix-primary)', strokeWidth: 2 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interns" 
                      name="New Interns" 
                      stroke="var(--novakinetix-accent)" 
                      strokeWidth={3} 
                      dot={{ r: 6, fill: 'var(--novakinetix-accent)' }}
                      activeDot={{ r: 10, stroke: 'var(--novakinetix-accent)', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="applications" 
                      name="Applications" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      dot={{ r: 6, fill: '#10B981' }}
                      activeDot={{ r: 10, stroke: '#10B981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* User Distribution Pie Chart */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">User Distribution</CardTitle>
              <CardDescription className="text-gray-600">
                Breakdown by user type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayUserDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {displayUserDistribution.map((entry: any, index: number) => (
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
                {displayUserDistribution.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-[var(--novakinetix-primary)]" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Access key management areas and administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full h-16 text-left p-4 hover:bg-blue-50 hover:border-blue-300">
                  <Link href="/admin/users">
                    <Users className="mr-3 h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">User Management</div>
                      <div className="text-xs text-gray-500">Manage accounts & permissions</div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full h-16 text-left p-4 hover:bg-purple-50 hover:border-purple-300">
                  <Link href="/admin/internships">
                    <Briefcase className="mr-3 h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-semibold">Internship Hub</div>
                      <div className="text-xs text-gray-500">Manage programs & opportunities</div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full h-16 text-left p-4 hover:bg-green-50 hover:border-green-300">
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-3 h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-semibold">Analytics</div>
                      <div className="text-xs text-gray-500">View detailed reports</div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full h-16 text-left p-4 hover:bg-amber-50 hover:border-amber-300">
                  <Link href="/admin/settings">
                    <Shield className="mr-3 h-5 w-5 text-amber-600" />
                    <div>
                      <div className="font-semibold">Settings</div>
                      <div className="text-xs text-gray-500">Configure system & security</div>
                    </div>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}