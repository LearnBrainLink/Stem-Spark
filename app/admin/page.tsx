import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, GraduationCap, Video, Briefcase, Mail, BarChart3, Shield, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const adminStats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "text-blue-600" },
    { label: "Active Students", value: "856", icon: GraduationCap, color: "text-green-600" },
    { label: "Video Lessons", value: "45", icon: Video, color: "text-purple-600" },
    { label: "Internship Applications", value: "23", icon: Briefcase, color: "text-orange-600" },
  ]

  const quickActions = [
    {
      title: "User Management",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Video Management",
      description: "Upload and manage educational videos",
      href: "/admin/videos",
      icon: Video,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      title: "Internship Applications",
      description: "Review and manage internship applications",
      href: "/admin/applications",
      icon: Briefcase,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      title: "Email Configuration",
      description: "Configure email settings and templates",
      href: "/admin/email-config",
      icon: Mail,
      color: "bg-green-50 text-green-600 border-green-200",
    },
    {
      title: "Admin Setup",
      description: "Create and manage admin accounts",
      href: "/admin/setup",
      icon: Shield,
      color: "bg-red-50 text-red-600 border-red-200",
    },
    {
      title: "Analytics",
      description: "View platform analytics and reports",
      href: "/admin/analytics",
      icon: BarChart3,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your STEM Spark Academy platform</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-200">
          System Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={action.href}>
                    Access {action.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium">New user registration</p>
                <p className="text-sm text-gray-600">student@example.com joined as a student</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium">Video uploaded</p>
                <p className="text-sm text-gray-600">Introduction to Robotics added to library</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium">Internship application</p>
                <p className="text-sm text-gray-600">New application for Summer Engineering Program</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
