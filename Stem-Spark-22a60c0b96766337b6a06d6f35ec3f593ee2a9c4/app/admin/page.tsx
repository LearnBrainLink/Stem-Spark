"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, Briefcase, Mail, DollarSign, TrendingUp, Shield, AlertCircle, CheckCircle } from "lucide-react";
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { getDashboardStats } from './actions';
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
}

const StatCard = ({ title, value, icon: Icon, description, color, bgColor, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <motion.div 
            className={`p-2 rounded-full ${bgColor}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div 
            className="text-2xl font-bold text-gray-900"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: delay + 0.2 }}
          >
            {value}
          </motion.div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
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
    <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  </motion.div>
);

const sampleChartData = [
  { name: 'Jan', users: 4000, interns: 2400 },
  { name: 'Feb', users: 3000, interns: 1398 },
  { name: 'Mar', users: 2000, interns: 9800 },
  { name: 'Apr', users: 2780, interns: 3908 },
  { name: 'May', users: 1890, interns: 4800 },
  { name: 'Jun', users: 2390, interns: 3800 },
  { name: 'Jul', users: 3490, interns: 4300 },
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
      description: isSampleData ? "Database connection issue" : "All user accounts",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Internships",
      value: numberFormatter.format(stats.internships),
      icon: Briefcase,
      description: isSampleData ? "Database connection issue" : "All programs created",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Applications",
      value: numberFormatter.format(stats.applications),
      icon: Mail,
      description: isSampleData ? "Database connection issue" : "Received for all internships",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(stats.revenue),
      icon: DollarSign,
      description: isSampleData ? "Database connection issue" : "From completed donations",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
  ] : [];

  return (
    <motion.div 
      className="space-y-6 p-2 sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500">
            Welcome back! Here's a summary of your platform's activity.
          </p>
          <AnimatePresence>
            {connectionStatus === 'connected' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-green-600"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </motion.div>
            )}
            {connectionStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 text-red-600"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {isSampleData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <p className="text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Database tables may not exist or have RLS policy issues. Check your Supabase setup.
            </p>
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
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-600 font-medium">Connection Error</p>
                  </div>
                  <p className="text-red-600 text-sm mb-4">{error}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry Connection
                  </Button>
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

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <motion.div 
          className="col-span-1 lg:col-span-2"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly new users and interns. (Sample Data)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="New Users" 
                      stroke="var(--novakinetix-primary)" 
                      strokeWidth={2} 
                      dot={{ r: 4 }} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interns" 
                      name="New Interns" 
                      stroke="var(--novakinetix-accent)" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-sm hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to key management areas.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-3">
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full">
                  <Link href="/admin/users">
                    <Users className="mr-2 h-4 w-4" /> User Management
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full">
                  <Link href="/admin/internships">
                    <Briefcase className="mr-2 h-4 w-4" /> Internship Hub
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full">
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-2 h-4 w-4" /> View Full Analytics
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                <Button asChild variant="outline" className="justify-start w-full">
                  <Link href="/admin/settings">
                    <Shield className="mr-2 h-4 w-4" /> Settings & Security
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}