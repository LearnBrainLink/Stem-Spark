import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Award, Video, Building2, LogOut, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { simpleSignOut } from "@/lib/simple-auth"

export default function StudentDashboard() {
  return (
    <div className="min-h-screen hero-gradient">
      {/* Enhanced Header with Larger Logo */}
      <header className="bg-white/90 backdrop-blur-md shadow-brand border-b border-brand-light/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4 group">
            <Logo variant="large" className="group-hover:scale-110 transition-transform duration-300 logo-nav" />
            <div className="hidden md:block">
              <h1 className="text-3xl font-bold brand-text-gradient">NOVAKINETIX</h1>
              <p className="text-lg font-semibold text-brand-secondary">ACADEMY</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
            <form action={simpleSignOut}>
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
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
        {/* Enhanced Welcome Section */}
        <div className="mb-12 text-center">
          <h2 className="text-display brand-text-gradient mb-4">Welcome back, Student! 🎓</h2>
          <p className="text-xl text-brand-secondary font-medium max-w-2xl mx-auto">
            Continue your exciting STEM learning journey and unlock new possibilities
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="stat-card group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-brand-primary group-hover:text-brand-secondary transition-colors">
                <div className="p-3 bg-blue-100 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary mb-2">2</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                Events this week
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-brand-primary group-hover:text-brand-secondary transition-colors">
                <div className="p-3 bg-green-100 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary mb-2">75%</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                Current courses
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-brand-primary group-hover:text-brand-secondary transition-colors">
                <div className="p-3 bg-yellow-100 rounded-full mr-4 group-hover:bg-yellow-200 transition-colors">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary mb-2">3</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                New badges earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="internships" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white/80 backdrop-blur-sm border border-brand-light/30 rounded-xl p-2">
            <TabsTrigger
              value="internships"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              Internships
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              Courses
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              My Progress
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internships" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="admin-card group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                    Summer Engineering Program
                  </CardTitle>
                  <CardDescription className="text-lg text-brand-secondary font-medium">
                    TechCorp Industries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-base font-medium">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <span>8 weeks (Jun 15 - Aug 10)</span>
                  </div>
                  <p className="text-brand-secondary leading-relaxed">
                    Work on real-world projects with experienced engineers and gain hands-on experience.
                  </p>
                  <div className="pt-4">
                    <Button size="lg" className="button-primary w-full" asChild>
                      <Link href="/internships">View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="admin-card group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-brand-primary group-hover:text-brand-secondary transition-colors">
                    Robotics Workshop
                  </CardTitle>
                  <CardDescription className="text-lg text-brand-secondary font-medium">
                    Innovation Labs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-base font-medium">
                    <Clock className="h-5 w-5 mr-3 text-green-500" />
                    <span>6 weeks (Jun 20 - Aug 1)</span>
                  </div>
                  <p className="text-brand-secondary leading-relaxed">
                    Build and program robots with cutting-edge technology and expert mentorship.
                  </p>
                  <div className="pt-4">
                    <Button size="lg" className="button-primary w-full" asChild>
                      <Link href="/internships">View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="admin-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-brand-primary">My Courses</CardTitle>
                <CardDescription className="text-lg text-brand-secondary">
                  Track your enrolled courses and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-brand-light/30">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-brand-primary">Currently enrolled in 3 courses</h3>
                    <p className="text-brand-secondary">Continue learning with our comprehensive curriculum</p>
                  </div>
                </div>
                <Button className="button-primary w-full h-14 text-lg" asChild>
                  <Link href="/videos">Browse All Courses</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="admin-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-brand-primary">Learning Progress</CardTitle>
                <CardDescription className="text-lg text-brand-secondary">
                  Track your achievements and growth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-brand-primary">Introduction to Engineering</span>
                    <span className="text-lg font-bold text-brand-secondary">75%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-brand-primary">Robotics Fundamentals</span>
                    <span className="text-lg font-bold text-brand-secondary">40%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full transition-all duration-500"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-brand-primary">Environmental Science</span>
                    <span className="text-lg font-bold text-brand-secondary">90%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: "90%" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
