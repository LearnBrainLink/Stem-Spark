"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, GraduationCap, Video, Briefcase, Mail, Shield, ArrowRight, TrendingUp, DollarSign, Activity } from "lucide-react";
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

const statsData = [
  {
    title: "Total Users",
    value: "12,458",
    icon: Users,
    change: "+12.5%",
    description: "vs. last month",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    title: "Internships",
    value: "132",
    icon: Briefcase,
    change: "+8.1%",
    description: "active programs",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    title: "Applications",
    value: "1,289",
    icon: Mail,
    change: "-2.3%",
    description: "awaiting review",
    color: "text-amber-500",
    bgColor: "bg-amber-50"
  },
  {
    title: "Total Revenue",
    value: "$28,430",
    icon: DollarSign,
    change: "+20.1%",
    description: "this quarter",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50"
  },
];

const sampleChartData = [
  { name: 'Jan', users: 4000, interns: 2400 },
  { name: 'Feb', users: 3000, interns: 1398 },
  { name: 'Mar', users: 2000, interns: 9800 },
  { name: 'Apr', users: 2780, interns: 3908 },
  { name: 'May', users: 1890, interns: 4800 },
  { name: 'Jun', users: 2390, interns: 3800 },
  { name: 'Jul', users: 3490, interns: 4300 },
];

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  description: string;
  color: string;
  bgColor: string;
  isLoading: boolean;
}

const StatCard = ({ title, value, icon: Icon, change, description, color, bgColor, isLoading }: StatCardProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
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
  }

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
        <p className="text-xs text-gray-500 mt-1">
          <span className={change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>{change}</span>
          {' '}{description}
        </p>
      </CardContent>
    </Card>
  );
};


export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This simulates a data fetch.
    // Once your Supabase connection is fixed, you can replace this with a real data call.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's a summary of your platform's activity.</p>
      </header>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <StatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Charts and Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly new users and interns.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to key management areas.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
             <Button onClick={() => router.push('/admin/users')} variant="outline" className="justify-start">
               <Users className="mr-2 h-4 w-4" /> User Management
             </Button>
             <Button onClick={() => router.push('/admin/internships')} variant="outline" className="justify-start">
               <Briefcase className="mr-2 h-4 w-4" /> Internship Hub
             </Button>
             <Button onClick={() => router.push('/admin/analytics')} variant="outline" className="justify-start">
               <TrendingUp className="mr-2 h-4 w-4" /> View Full Analytics
             </Button>
             <Button onClick={() => router.push('/admin/settings')} variant="outline" className="justify-start">
               <Shield className="mr-2 h-4 w-4" /> Settings & Security
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}