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
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2 shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm md:text-base">Manage your STEM Spark Academy platform</p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 px-3 py-1 text-xs md:text-sm">
            System Online
          </Badge>
        </div>

        {/* Stats Grid - compact, no page scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-2 shrink-0">
          {adminStats.map((stat, index) => (
            <Card key={index} className="shadow-md border-0 bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color}`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions - scrollable if needed */}
        <div className="flex-1 min-h-0 overflow-auto">
          <div>
            <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg border ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{action.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-500">{action.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full bg-brand-primary text-white hover:bg-brand-secondary font-semibold">
                      <Link href={action.href} className="flex items-center justify-center">
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
          <Card className="shadow-md border-0 bg-white mb-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-gray-500">Latest platform activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">New user registration</p>
                    <p className="text-sm text-gray-600">student@example.com joined as a student</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <Video className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-medium">Video uploaded</p>
                    <p className="text-sm text-gray-600">Introduction to Robotics added to library</p>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                  <Briefcase className="w-6 h-6 text-orange-600" />
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
      </div>
    </div>
  )
}
