'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  BookOpen, 
  Clock,
  Users,
  Star,
  Search,
  Filter,
  Play,
  ArrowRight,
  GraduationCap,
  Target,
  Award
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty_level: string
  duration_hours: number
  instructor_id: string
  instructor_name?: string
  thumbnail_url?: string
  learning_objectives?: string[]
  prerequisites?: string[]
  isEnrolled?: boolean
  progress?: number
}

export default function LearningPath() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        window.location.href = '/login'
        return
      }

      await loadUserProfile(authUser.id)
      await loadCourses(authUser.id)
    } catch (error) {
      console.error('Error in checkAuth:', error)
    }
  }

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setUser(profile)
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const loadCourses = async (userId: string) => {
    try {
      // Load all active courses
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          instructor:profiles!courses_instructor_id_fkey(full_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (!courseError && courseData) {
        // Load user's enrollments
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', userId)

        if (!enrollmentError && enrollmentData) {
          const enrolledCourseIds = enrollmentData.map(e => e.course_id)
          
          const coursesWithEnrollment = courseData.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty_level: course.difficulty_level,
            duration_hours: course.duration_hours,
            instructor_id: course.instructor_id,
            instructor_name: course.instructor?.full_name || 'Unknown Instructor',
            thumbnail_url: course.thumbnail_url,
            learning_objectives: course.learning_objectives,
            prerequisites: course.prerequisites,
            isEnrolled: enrolledCourseIds.includes(course.id),
            progress: enrollmentData.find(e => e.course_id === course.id)?.progress_percentage || 0
          }))

          setCourses(coursesWithEnrollment)
          setEnrolledCourses(coursesWithEnrollment.filter(c => c.isEnrolled))
        } else {
          setCourses(courseData.map(course => ({
            ...course,
            instructor_name: course.instructor?.full_name || 'Unknown Instructor',
            isEnrolled: false,
            progress: 0
          })))
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error in loadCourses:', error)
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'active',
          progress_percentage: 0
        })

      if (error) {
        console.error('Error enrolling in course:', error)
        alert('Failed to enroll in course')
        return
      }

      alert('Successfully enrolled in course!')
      await loadCourses(user.id)
    } catch (error) {
      console.error('Error in handleEnroll:', error)
      alert('Failed to enroll in course')
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || course.difficulty_level === selectedDifficulty
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [...new Set(courses.map(c => c.category))]
  const difficulties = ['beginner', 'intermediate', 'advanced']

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Loading courses...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/novakinetix-logo.png"
                  alt="NovaKinetix Academy"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                />
                <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/student-dashboard">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* My Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              My Enrolled Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="relative">
                  {course.thumbnail_url && (
                    <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        width={200}
                        height={200}
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{course.instructor_name}</span>
                        <span>{course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.difficulty_level}</Badge>
                        <Button size="sm" asChild>
                          <Link href={`/learning-path?course=${course.id}`}>
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Available Courses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.filter(c => !c.isEnrolled).map((course) => (
              <Card key={course.id} className="relative">
                {course.thumbnail_url && (
                  <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      width={200}
                      height={200}
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.learning_objectives && course.learning_objectives.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Learning Objectives:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {course.learning_objectives.slice(0, 2).map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <Target className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{course.instructor_name}</span>
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.difficulty_level}</Badge>
                      <Button size="sm" onClick={() => handleEnroll(course.id)}>
                        <BookOpen className="h-4 w-4 mr-1" />
                        Enroll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredCourses.filter(c => !c.isEnrolled).length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses match your search criteria</p>
            <Button className="mt-4" onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setSelectedDifficulty('all')
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 