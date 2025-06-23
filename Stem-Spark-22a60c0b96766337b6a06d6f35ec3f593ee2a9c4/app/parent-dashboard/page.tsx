"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  BookOpen, 
  Video, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  TrendingUp,
  Award,
  Clock,
  Users,
  FileText,
  Bell,
  Search,
  Filter
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

interface Child {
  id: string;
  name: string;
  grade: number;
  school: string;
  progress: number;
  lastActivity: string;
  courses: number;
  achievements: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Mock data for children (in real app, fetch from parent_student_relationships table)
      const mockChildren: Child[] = [
        {
          id: "1",
          name: "Alex Johnson",
          grade: 7,
          school: "Lincoln Middle School",
          progress: 85,
          lastActivity: "2 hours ago",
          courses: 4,
          achievements: 12
        },
        {
          id: "2", 
          name: "Sarah Johnson",
          grade: 5,
          school: "Lincoln Elementary School",
          progress: 92,
          lastActivity: "1 day ago",
          courses: 3,
          achievements: 8
        }
      ];
      setChildren(mockChildren);

      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Achievement Unlocked",
          message: "Alex has completed the Advanced Math module!",
          type: "success",
          timestamp: "2 hours ago",
          read: false
        },
        {
          id: "2",
          title: "Weekly Progress Report",
          message: "Sarah's weekly progress report is now available.",
          type: "info",
          timestamp: "1 day ago",
          read: true
        },
        {
          id: "3",
          title: "Upcoming Event",
          message: "STEM Fair registration closes in 3 days.",
          type: "warning",
          timestamp: "2 days ago",
          read: false
        }
      ];
      setNotifications(mockNotifications);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm mb-8">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "children", label: "My Children", icon: Users },
            { id: "progress", label: "Progress", icon: Award },
            { id: "resources", label: "Resources", icon: BookOpen },
            { id: "calendar", label: "Calendar", icon: Calendar },
            { id: "communication", label: "Communication", icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{children.length}</div>
                  <p className="text-xs text-muted-foreground">Active students</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(children.reduce((acc, child) => acc + child.progress, 0) / children.length)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Across all children</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {children.reduce((acc, child) => acc + child.courses, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Enrolled courses</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {children.reduce((acc, child) => acc + child.achievements, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Total earned</p>
                </CardContent>
              </Card>
            </div>

            {/* Children Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>My Children</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {child.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{child.name}</h3>
                          <p className="text-sm text-gray-600">Grade {child.grade} • {child.school}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{child.progress}%</div>
                        <p className="text-xs text-gray-500">Progress</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Recent Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${
                      notification.type === 'success' ? 'border-green-500 bg-green-50' :
                      notification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      notification.type === 'error' ? 'border-red-500 bg-red-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Children Tab */}
        {activeTab === "children" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Children</h2>
              <Button>
                <User className="w-4 h-4 mr-2" />
                Add Child
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {child.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <p className="text-sm text-gray-600">Grade {child.grade}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>School</span>
                        <span className="font-medium">{child.school}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium text-blue-600">{child.progress}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Courses</span>
                        <span className="font-medium">{child.courses}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Achievements</span>
                        <span className="font-medium">{child.achievements}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Last Activity</span>
                        <span>{child.lastActivity}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        View Progress
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === "progress" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Progress Tracking</h2>
            <Card>
              <CardHeader>
                <CardTitle>Academic Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {children.map((child) => (
                    <div key={child.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{child.name}</h3>
                        <Badge variant="secondary">Grade {child.grade}</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span>{child.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${child.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Courses Enrolled:</span>
                            <span className="font-medium ml-2">{child.courses}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Achievements:</span>
                            <span className="font-medium ml-2">{child.achievements}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Parent Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Learning Guides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Access comprehensive guides to support your child's learning journey.</p>
                  <Button variant="outline" className="w-full">View Guides</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    <span>Parent Workshops</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Join our workshops to learn effective strategies for supporting STEM education.</p>
                  <Button variant="outline" className="w-full">Register Now</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span>Progress Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">Download detailed progress reports and assessment summaries.</p>
                  <Button variant="outline" className="w-full">Download</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Family Calendar</h2>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">STEM Fair</h3>
                      <p className="text-sm text-gray-600">Registration closes in 3 days</p>
                    </div>
                    <Badge variant="secondary">Dec 15</Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Achievement Ceremony</h3>
                      <p className="text-sm text-gray-600">Alex's math module completion</p>
                    </div>
                    <Badge variant="secondary">Dec 20</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === "communication" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Communication Hub</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">AJ</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Alex Johnson</h4>
                        <p className="text-sm text-gray-600">Completed the advanced math challenge!</p>
                      </div>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">SJ</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Sarah Johnson</h4>
                        <p className="text-sm text-gray-600">Started the science project</p>
                      </div>
                      <span className="text-xs text-gray-500">1d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Message to Teacher
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Parent Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Request Progress Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Contact Info
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 