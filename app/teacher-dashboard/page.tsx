import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "@/lib/auth-actions"
import { BookOpen, Users, LogOut, Settings, Video, Building2, GraduationCap, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default async function TeacherDashboard() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "teacher") {
    redirect("/login")
  }

  // Get teacher statistics
  const { data: students } = await supabase.from("profiles").select("id").eq("role", "student")
  const { data: videos } = await supabase.from("videos").select("id").eq("created_by", user.id)
  const { data: internships } = await supabase.from("internships").select("id")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              STEM Spark Academy
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {profile?.full_name || user.email}!</span>
            <div className="flex items-center gap-2">
              <Link href="/videos">
                <Button variant="outline" size="sm">
                  <Video className="w-4 h-4 mr-2" />
                  Videos
                </Button>
              </Link>
              <Link href="/internships">
                <Button variant="outline" size="sm">
                  <Building2 className="w-4 h-4 mr-2" />
                  Internships
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}! 👨‍🏫
          </h1>
          <p className="text-gray-600">Inspire the next generation of engineers</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">Teacher Account</span>
            </div>
            {profile.school_name && <span className="text-sm text-gray-500">• {profile.school_name}</span>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Educational content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internships</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{internships?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Available opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">Student engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Teacher Tools</CardTitle>
            <CardDescription>Manage your educational content and track student progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/videos">
                <Button className="w-full">
                  <Video className="w-4 h-4 mr-2" />
                  Manage Videos
                </Button>
              </Link>
              <Link href="/internships">
                <Button className="w-full" variant="outline">
                  <Building2 className="w-4 h-4 mr-2" />
                  View Internships
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Student Progress
              </Button>
              <Button className="w-full" variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your students and courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">New Student Registration</h3>
                    <p className="text-sm text-gray-600">Sarah Johnson joined the platform</p>
                  </div>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Video Completion</h3>
                    <p className="text-sm text-gray-600">Mike Chen completed "Introduction to Programming"</p>
                  </div>
                  <span className="text-xs text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Internship Application</h3>
                    <p className="text-sm text-gray-600">Emma Davis applied for Summer Engineering Program</p>
                  </div>
                  <span className="text-xs text-gray-500">1 day ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>Overview of student achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-500" />
                    <div>
                      <h3 className="font-semibold">Top Performer</h3>
                      <p className="text-sm text-gray-600">Alex Thompson - 98% completion rate</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Most Improved</h3>
                      <p className="text-sm text-gray-600">Jordan Lee - 45% improvement this month</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">Class Average</h3>
                      <p className="text-sm text-gray-600">87% completion rate across all courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
