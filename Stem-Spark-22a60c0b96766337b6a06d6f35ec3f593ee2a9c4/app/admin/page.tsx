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
import AdminLayout from './layout';

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
        <CardHeader className="flex flex-row items-center justify-between pb-1">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
          <motion.div 
            className={`p-2 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}
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
          <p className="text-sm text-gray-600 mb-1">{description}</p>
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
    <AdminLayout>
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
              <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, Admin! Here's a quick overview of your platform's performance.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Refresh Data
              </Button>
              <Button className="bg-[var(--novakinetix-primary)] text-white hover:bg-[var(--novakinetix-dark)]">
                Generate Report
              </Button>
            </div>
          </div>
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
                  <CardContent>
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">User Growth</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={displayChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" />
                  <Line type="monotone" dataKey="interns" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="applications" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700">User Distribution</CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={displayUserDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {displayUserDistribution.map((entry: { name: string; value: number; color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

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
      </motion.div>
    </AdminLayout>
  );
}