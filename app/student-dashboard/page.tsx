import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, Award, Video, Building2, LogOut } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { simpleSignOut } from "@/lib/simple-auth"

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-light">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Logo width={120} height={60} />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/videos">
              <Button variant="outline" size="sm" className="text-brand-navy border-brand-navy">
                <Video className="w-4 h-4 mr-2" />
                Videos
              </Button>
            </Link>
            <Link href="/internships">
              <Button variant="outline" size="sm" className="text-brand-navy border-brand-navy">
                <Building2 className="w-4 h-4 mr-2" />
                Internships
              </Button>
            </Link>
            <form action={simpleSignOut}>
              <Button variant="outline" size="sm" className="text-brand-navy border-brand-navy">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-brand-navy">Welcome back, Student!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-brand-navy">
                  <Calendar className="h-5 w-5 mr-2 text-brand-orange" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">You have 2 upcoming events this week</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-brand-navy">
                  <BookOpen className="h-5 w-5 mr-2 text-brand-orange" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">75% complete in current courses</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center text-brand-navy">
                  <Award className="h-5 w-5 mr-2 text-brand-orange" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">3 new badges earned this month</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="internships" className="space-y-4">
          <TabsList>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
          </TabsList>
          <TabsContent value="internships" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-brand-navy">Summer Engineering Program</CardTitle>
                  <CardDescription>TechCorp Industries</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>8 weeks (Jun 15 - Aug 10)</span>
                  </div>
                  <p className="text-sm text-gray-600">Work on real-world projects with experienced engineers.</p>
                  <div className="pt-2">
                    <Button size="sm" className="bg-brand-navy text-white" asChild>
                      <Link href="/internships">View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-brand-navy">Robotics Workshop</CardTitle>
                  <CardDescription>Innovation Labs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>6 weeks (Jun 20 - Aug 1)</span>
                  </div>
                  <p className="text-sm text-gray-600">Build and program robots with cutting-edge technology.</p>
                  <div className="pt-2">
                    <Button size="sm" className="bg-brand-navy text-white" asChild>
                      <Link href="/internships">View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="courses">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-brand-navy">My Courses</CardTitle>
                <CardDescription>Track your enrolled courses and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p>You are currently enrolled in 3 courses.</p>
                <Button className="mt-4 bg-brand-navy text-white" asChild>
                  <Link href="/videos">Browse All Courses</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="progress">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-brand-navy">Learning Progress</CardTitle>
                <CardDescription>Track your achievements and growth</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Introduction to Engineering</span>
                    <span className="text-sm text-gray-500">75%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-navy rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Robotics Fundamentals</span>
                    <span className="text-sm text-gray-500">40%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-navy rounded-full" style={{ width: "40%" }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environmental Science</span>
                    <span className="text-sm text-gray-500">90%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-navy rounded-full" style={{ width: "90%" }}></div>
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
