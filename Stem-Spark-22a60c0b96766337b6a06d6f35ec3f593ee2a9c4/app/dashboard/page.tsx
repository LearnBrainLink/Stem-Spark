import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "@/lib/enhanced-auth-actions"
import { BookOpen, Trophy, Users, LogOut, Settings, Video, Building2, TrendingUp, Clock, Star } from "lucide-react"
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
    <div className="min-h-screen hero-gradient">
      {/* Enhanced Header with Larger Logo */}
      <header className="bg-white/90 backdrop-blur-md border-b border-brand-light/30 shadow-brand">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <Logo variant="large" className="group-hover:scale-110 transition-transform duration-300 logo-nav" />
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold brand-text-gradient">NOVAKINETIX</h1>
              <p className="text-lg font-semibold text-brand-secondary">ACADEMY</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 bg-brand-accent/20 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-brand-primary">
                Welcome, {profile?.full_name?.split(" ")[0] || "User"}!
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/videos">
                <Button
                  variant="outline"
                  size="lg"
                  className="interactive-button border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Videos
                </Button>
              </Link>
              <Link href="/internships">
                <Button
                  variant="outline"
                  size="lg"
                  className="interactive-button border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Internships
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg" className="interactive-button">
                  <Settings className="w-5 h-5 mr-2" />
                  Profile
                </Button>
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin">
                  <Button size="lg" className="button-primary">
                    <Users className="w-5 h-5 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <form action={signOut}>
                <Button
                  variant="outline"
                  size="lg"
                  className="interactive-button border-red-300 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Enhanced Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-display brand-text-gradient mb-4">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}! 🚀
          </h1>
          <p className="text-xl text-brand-secondary font-medium max-w-2xl mx-auto">
            {profile?.role === "admin"
              ? "Manage and oversee your NOVAKINETIX ACADEMY platform with powerful admin tools"
              : "Continue your exciting STEM learning journey and unlock new possibilities"}
          </p>
        </div>

        {/* Enhanced Role-specific dashboard content */}
        {profile?.role === "admin" ? (
          // Enhanced Admin Dashboard
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Total Users</CardTitle>
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">{(dashboardData as any).totalUsers}</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    Registered users
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Active Internships</CardTitle>
                  <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">
                    {(dashboardData as any).activeInternships}
                  </div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-blue-500" />
                    Currently available
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Learning Videos</CardTitle>
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Video className="h-6 w-6 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">{(dashboardData as any).totalVideos}</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    Educational content
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Platform Health</CardTitle>
                  <div className="p-3 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-colors">
                    <Trophy className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">Excellent</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Enhanced Student/Teacher Dashboard
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Courses Completed</CardTitle>
                  <div className="p-3 bg-yellow-100 rounded-full group-hover:bg-yellow-200 transition-colors">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">3</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                    +2 from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Projects Built</CardTitle>
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">12</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    +4 this week
                  </p>
                </CardContent>
              </Card>

              <Card className="stat-card group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-bold text-brand-primary">Community Rank</CardTitle>
                  <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-brand-primary mb-2">#47</div>
                  <p className="text-sm text-brand-secondary font-medium flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    Top 15% of learners
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <Card className="admin-card mt-12">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-brand-primary">Quick Actions</CardTitle>
            <CardDescription className="text-lg text-brand-secondary">
              {profile?.role === "admin"
                ? "Manage your platform efficiently"
                : "Continue your learning journey with these tools"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile?.role === "admin" ? (
                <>
                  <Link href="/admin/videos">
                    <Button className="w-full h-20 text-lg button-primary group" size="lg">
                      <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Manage Videos
                    </Button>
                  </Link>
                  <Link href="/admin/internships">
                    <Button className="w-full h-20 text-lg button-secondary group" size="lg">
                      <Building2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Manage Internships
                    </Button>
                  </Link>
                  <Link href="/admin/applications">
                    <Button className="w-full h-20 text-lg button-primary group" size="lg">
                      <Users className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      View Applications
                    </Button>
                  </Link>
                  <Link href="/admin/setup">
                    <Button className="w-full h-20 text-lg button-secondary group" size="lg">
                      <Settings className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Admin Setup
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/videos">
                    <Button className="w-full h-20 text-lg button-primary group" size="lg">
                      <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Watch Videos
                    </Button>
                  </Link>
                  <Link href="/internships">
                    <Button className="w-full h-20 text-lg button-secondary group" size="lg">
                      <Building2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Find Internships
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="w-full h-20 text-lg button-primary group" size="lg">
                      <Settings className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Update Profile
                    </Button>
                  </Link>
                  <Button className="w-full h-20 text-lg button-secondary group" size="lg">
                    <BookOpen className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                    Start Project
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Activity or Content */}
        <Card className="admin-card mt-8">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-brand-primary">
              {profile?.role === "admin" ? "Recent Platform Activity" : "Continue Learning"}
            </CardTitle>
            <CardDescription className="text-lg text-brand-secondary">
              {profile?.role === "admin" ? "Latest activity across the platform" : "Pick up where you left off"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.role === "admin" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-blue-50 to-white hover:shadow-brand transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-primary">New User Registration</h3>
                      <p className="text-brand-secondary font-medium">Student • 2 minutes ago</p>
                    </div>
                  </div>
                  <Button className="interactive-button">View</Button>
                </div>
                <div className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-green-50 to-white hover:shadow-brand transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-primary">Internship Application</h3>
                      <p className="text-brand-secondary font-medium">Software Engineering • 15 minutes ago</p>
                    </div>
                  </div>
                  <Button className="interactive-button">Review</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-purple-50 to-white hover:shadow-brand transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-primary">Build a Robot Arm</h3>
                      <p className="text-brand-secondary font-medium">Engineering Design • 75% Complete</p>
                      <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                        <div className="w-3/4 h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <Button className="button-primary">Continue</Button>
                </div>
                <div className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-blue-50 to-white hover:shadow-brand transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Video className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-primary">Coding with Scratch</h3>
                      <p className="text-brand-secondary font-medium">Programming • Not Started</p>
                    </div>
                  </div>
                  <Button className="button-secondary">Start</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
