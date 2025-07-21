import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Users, GraduationCap, Award, LogOut, TrendingUp, Star, Clock } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { simpleSignOut } from "@/lib/simple-auth"
import WelcomeBackModal from "@/components/WelcomeBackModal"

export default function InternDashboard() {
  const userName = "John Doe" // This should be dynamically fetched based on the logged-in user

  return (
    <div className="min-h-screen hero-gradient px-2 sm:px-6 md:px-10">
      {/* Enhanced Header with Larger Logo */}
      <header className="bg-white/90 backdrop-blur-md shadow-brand border-b border-brand-light/30">
        <div className="max-w-7xl mx-auto px-2 sm:px-8 lg:px-10 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-4 group">
            <Logo variant="large" className="group-hover:scale-110 transition-transform duration-300 logo-nav w-12 h-12 sm:w-16 sm:h-16" />
            <div className="hidden md:block">
              <h1 className="text-2xl sm:text-3xl font-bold brand-text-gradient">NOVAKINETIX</h1>
              <p className="text-base sm:text-lg font-semibold text-brand-secondary">ACADEMY</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-center">
            <Link href="/videos">
              <Button className="interactive-button border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-4 py-2 rounded-md transition">
                Videos
              </Button>
            </Link>
            <Link href="/internships">
              <Button className="interactive-button border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white px-4 py-2 rounded-md transition">
                Internships
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="interactive-button border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white px-4 py-2 rounded-md transition">
                Profile
              </Button>
            </Link>
            <form action={simpleSignOut}>
              <Button className="interactive-button border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition">
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
          <h2 className="text-display brand-text-gradient mb-4">Welcome back, {userName}! 🎉</h2>
          <p className="text-xl text-brand-secondary font-medium max-w-2xl mx-auto">
            Inspire and guide the next generation of STEM innovators
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="stat-card group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-brand-primary group-hover:text-brand-secondary transition-colors">
                <div className="p-3 bg-blue-100 rounded-full mr-4 group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary mb-2">24</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                Active students
              </p>
            </CardContent>
          </Card>

          <Card className="stat-card group">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center text-brand-primary group-hover:text-brand-secondary transition-colors">
                <div className="p-3 bg-green-100 rounded-full mr-4 group-hover:bg-green-200 transition-colors">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-primary mb-2">3</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1 text-blue-500" />
                Active this semester
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
              <div className="text-3xl font-bold text-brand-primary mb-2">15</div>
              <p className="text-brand-secondary font-medium flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Student achievements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs */}
        <Tabs defaultValue="students" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-14 bg-white/80 backdrop-blur-sm border border-brand-light/30 rounded-xl p-2">
            <TabsTrigger
              value="students"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              My Students
            </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              My Courses
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="text-lg font-semibold data-[state=active]:bg-brand-primary data-[state=active]:text-white rounded-lg transition-all duration-300"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students" className="space-y-6">
            <Card className="admin-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-brand-primary">Student Management</CardTitle>
                <CardDescription className="text-lg text-brand-secondary">
                  View and manage your students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { name: "Alex Johnson", grade: "Grade 7", focus: "Engineering Focus", color: "blue" },
                    { name: "Samantha Lee", grade: "Grade 8", focus: "Robotics Focus", color: "green" },
                    { name: "Michael Chen", grade: "Grade 6", focus: "Environmental Science", color: "purple" },
                    { name: "Olivia Martinez", grade: "Grade 7", focus: "Engineering Focus", color: "orange" },
                  ].map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-brand transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 bg-${student.color}-100 rounded-full`}>
                          <GraduationCap className={`w-6 h-6 text-${student.color}-600`} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-brand-primary">{student.name}</p>
                          <p className="text-brand-secondary font-medium">
                            {student.grade} • {student.focus}
                          </p>
                        </div>
                      </div>
                      <Button className="interactive-button px-6 py-3 text-base rounded-md">View Profile</Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-8 h-14 text-lg button-primary">View All Students</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="admin-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-brand-primary">Course Management</CardTitle>
                <CardDescription className="text-lg text-brand-secondary">
                  Manage your teaching materials and courses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    title: "Introduction to Engineering",
                    grades: "Grades 6-7",
                    students: "24 students enrolled",
                    color: "blue",
                  },
                  {
                    title: "Robotics Fundamentals",
                    grades: "Grades 7-8",
                    students: "18 students enrolled",
                    color: "green",
                  },
                  {
                    title: "Environmental Science",
                    grades: "Grades 6-8",
                    students: "22 students enrolled",
                    color: "purple",
                  },
                ].map((course, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-6 border border-brand-light/30 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-brand transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-${course.color}-100 rounded-full`}>
                        <BookOpen className={`w-6 h-6 text-${course.color}-600`} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-brand-primary">{course.title}</p>
                        <p className="text-brand-secondary font-medium">
                          {course.grades} • {course.students}
                        </p>
                      </div>
                    </div>
                    <Button className="button-primary px-6 py-3 text-base rounded-md">Manage</Button>
                  </div>
                ))}
                <div className="pt-6">
                  <Button className="w-full h-14 text-lg button-secondary" asChild>
                    <Link href="/admin/videos">Manage All Courses</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="admin-card">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-brand-primary">Student Performance</CardTitle>
                <CardDescription className="text-lg text-brand-secondary">
                  Track student progress and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-brand-primary">Average Course Completion</span>
                      <span className="text-lg font-bold text-brand-secondary">72%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: "72%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-brand-primary">Student Engagement</span>
                      <span className="text-lg font-bold text-brand-secondary">85%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-brand-primary">Assignment Completion</span>
                      <span className="text-lg font-bold text-brand-secondary">68%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-8 h-14 text-lg button-primary">View Detailed Analytics</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Welcome Back Modal as Client Component */}
      <WelcomeBackModal userName={userName} />
    </div>
  )
}
