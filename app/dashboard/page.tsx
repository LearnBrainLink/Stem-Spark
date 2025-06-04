import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "@/lib/enhanced-auth-actions"
import { BookOpen, Trophy, Users, LogOut, Settings, Video, Building2 } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/login")
  }

  // Get user-specific data based on role
  let dashboardData = {}

  if (profile.role === "student") {
    // Get student progress and applications
    const { data: applications } = await supabase
      .from("internship_applications")
      .select("*, internships(title)")
      .eq("student_id", user.id)

    dashboardData = { applications }
  } else if (profile.role === "admin") {
    // Get admin statistics
    const { data: userStats } = await supabase.from("profiles").select("role")
    const { data: internshipStats } = await supabase.from("internships").select("status")
    const { data: videoStats } = await supabase.from("videos").select("status")

    dashboardData = {
      totalUsers: userStats?.length || 0,
      activeInternships: internshipStats?.filter((i) => i.status === "active").length || 0,
      totalVideos: videoStats?.length || 0,
    }
  }

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
              {profile?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
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
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}! 👋
          </h1>
          <p className="text-gray-600">
            {profile?.role === "admin"
              ? "Manage your STEM Spark Academy platform"
              : "Continue your STEM learning journey"}
          </p>
        </div>

        {/* Role-specific dashboard content */}
        {profile?.role === "admin" ? (
          // Admin Dashboard
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(dashboardData as any).totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Internships</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(dashboardData as any).activeInternships}</div>
                <p className="text-xs text-muted-foreground">Currently available</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(dashboardData as any).totalVideos}</div>
                <p className="text-xs text-muted-foreground">Educational content</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Excellent</div>
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Student/Teacher Dashboard
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Completed</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">+2 from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects Built</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+4 this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Rank</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#47</div>
                <p className="text-xs text-muted-foreground">Top 15% of learners</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {profile?.role === "admin" ? "Manage your platform" : "Continue your learning journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {profile?.role === "admin" ? (
                <>
                  <Link href="/admin/videos">
                    <Button className="w-full" variant="outline">
                      <Video className="w-4 h-4 mr-2" />
                      Manage Videos
                    </Button>
                  </Link>
                  <Link href="/admin/internships">
                    <Button className="w-full" variant="outline">
                      <Building2 className="w-4 h-4 mr-2" />
                      Manage Internships
                    </Button>
                  </Link>
                  <Link href="/admin/applications">
                    <Button className="w-full" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      View Applications
                    </Button>
                  </Link>
                  <Link href="/admin/setup">
                    <Button className="w-full" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Setup
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/videos">
                    <Button className="w-full">
                      <Video className="w-4 h-4 mr-2" />
                      Watch Videos
                    </Button>
                  </Link>
                  <Link href="/internships">
                    <Button className="w-full" variant="outline">
                      <Building2 className="w-4 h-4 mr-2" />
                      Find Internships
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="w-full" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start Project
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity or Content */}
        <Card>
          <CardHeader>
            <CardTitle>{profile?.role === "admin" ? "Recent Platform Activity" : "Continue Learning"}</CardTitle>
            <CardDescription>
              {profile?.role === "admin" ? "Latest activity across the platform" : "Pick up where you left off"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.role === "admin" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">New User Registration</h3>
                    <p className="text-sm text-gray-600">Student • 2 minutes ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Internship Application</h3>
                    <p className="text-sm text-gray-600">Software Engineering • 15 minutes ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Build a Robot Arm</h3>
                    <p className="text-sm text-gray-600">Engineering Design • 75% Complete</p>
                  </div>
                  <Button>Continue</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Coding with Scratch</h3>
                    <p className="text-sm text-gray-600">Programming • Not Started</p>
                  </div>
                  <Button variant="outline">Start</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
