import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Users, Briefcase, Mail, DollarSign, TrendingUp, Shield } from "lucide-react";
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { createServerClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

// --- DATA FETCHING ---

async function getStats() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore);

  // It's much more efficient to run these simple counts directly
  // than to rely on views that might not be created.
  const userQuery = supabase.from('profiles').select('*', { count: 'exact', head: true });
  const internshipQuery = supabase.from('internships').select('*', { count: 'exact', head: true });
  const applicationQuery = supabase.from('internship_applications').select('*', { count: 'exact', head: true });
  // The type for 'status' is missing from database.types.ts, so we have to use 'any' to bypass the type-checker.
  const revenueQuery = supabase.from('donations').select('amount').eq('status' as any, 'completed' as any);

  const [
    userResult,
    internshipResult,
    applicationResult,
    revenueResult
  ] = await Promise.all([userQuery, internshipQuery, applicationQuery, revenueQuery]);

  const { count: userCount, error: userError } = userResult;
  const { count: internshipCount, error: internshipError } = internshipResult;
  const { count: applicationCount, error: applicationError } = applicationResult;
  const { data: revenueData, error: revenueError } = revenueResult;
  
  if(userError || internshipError || applicationError || revenueError) {
    console.error("Error fetching dashboard stats:", { userError, internshipError, applicationError, revenueError });
    // This will be caught by the nearest error.tsx boundary
    throw new Error("Could not fetch dashboard statistics. The database might be out of sync or unavailable.");
  }

  // The type for revenueData is missing from the generated types, so we cast it.
  const totalRevenue = (revenueData as {amount: number}[])?.reduce((sum, current) => sum + current.amount, 0) ?? 0;

  return {
    users: userCount ?? 0,
    internships: internshipCount ?? 0,
    applications: applicationCount ?? 0,
    revenue: totalRevenue,
  };
}


// --- COMPONENTS ---

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description: string;
  color: string;
  bgColor: string;
}

const StatCard = ({ title, value, icon: Icon, description, color, bgColor }: StatCardProps) => {
  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className={`p-2 rounded-full ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const StatCardSkeleton = () => (
  <Card className="shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-40" />
    </CardContent>
  </Card>
);

async function StatsGrid() {
  const stats = await getStats();

  const numberFormatter = new Intl.NumberFormat('en-US');
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const statsData = [
    {
      title: "Total Users",
      value: numberFormatter.format(stats.users),
      icon: Users,
      description: "All user accounts",
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Internships",
      value: numberFormatter.format(stats.internships),
      icon: Briefcase,
      description: "All programs created",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Applications",
      value: numberFormatter.format(stats.applications),
      icon: Mail,
      description: "Received for all internships",
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(stats.revenue),
      icon: DollarSign,
      description: "From completed donations",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

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
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's a summary of your platform's activity.</p>
      </header>
      
      <Suspense fallback={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      }>
        <StatsGrid />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-lg transition-shadow duration-300">
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
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #ddd',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="users" name="New Users" stroke="var(--novakinetix-primary)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="interns" name="New Interns" stroke="var(--novakinetix-accent)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to key management areas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
             <Button asChild variant="outline" className="justify-start">
               <Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> User Management</Link>
             </Button>
             <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/internships"><Briefcase className="mr-2 h-4 w-4" /> Internship Hub</Link>
             </Button>
             <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/analytics"><TrendingUp className="mr-2 h-4 w-4" /> View Full Analytics</Link>
             </Button>
             <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/settings"><Shield className="mr-2 h-4 w-4" /> Settings & Security</Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}