'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: 'student' | 'parent' | 'teacher'
  // Student fields
  grade?: string
  school?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  relationship?: string
  // Teacher fields
  subject?: string
  experience?: string
  // Parent fields
  children?: string
}

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match')
      setIsSubmitting(false)
      return
    }

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (authError) throw authError

      // Create profile based on role
      const profileData: any = {
        id: authData.user?.id,
        full_name: formData.fullName,
        email: formData.email,
        role: formData.role,
      }

      // Add role-specific fields
      if (formData.role === 'student') {
        profileData.grade = parseInt(formData.grade || '0')
        profileData.school = formData.school
      } else if (formData.role === 'teacher') {
        profileData.subject = formData.subject
        profileData.experience = formData.experience
      } else if (formData.role === 'parent') {
        profileData.children = formData.children
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profileData])

      if (profileError) throw profileError

      // Create parent-student relationship if student
      if (formData.role === 'student' && formData.parentName && formData.parentEmail) {
        const { error: relationshipError } = await supabase
          .from('parent_student_relationships')
          .insert([
            {
              student_id: authData.user?.id,
              parent_name: formData.parentName,
              parent_email: formData.parentEmail,
              parent_phone: formData.parentPhone,
              relationship: formData.relationship,
            },
          ])

        if (relationshipError) throw relationshipError
      }

      setMessage('Account created successfully! Please check your email to verify your account.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error creating account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/novakinetix-logo.png"
                alt="NovaKinetix Academy Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <span className="text-xl font-bold text-gray-900">NovaKinetix Academy</span>
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Signup Form */}
      <div className="flex items-center justify-center py-12">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join NovaKinetix Academy
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a: *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'student'})}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.role === 'student'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'parent'})}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.role === 'parent'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'teacher'})}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      formData.role === 'teacher'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Student-specific fields */}
              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Grade *
                    </label>
                    <select
                      required
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Grade</option>
                      {[9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      School *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.school}
                      onChange={(e) => setFormData({...formData, school: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent/Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent/Guardian Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Parent/Guardian Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship to Student *
                    </label>
                    <select
                      required
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="parent">Parent</option>
                      <option value="guardian">Guardian</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              {/* Teacher-specific fields */}
              {formData.role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject/Area of Expertise *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="e.g., Mathematics, Physics, Computer Science"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Years of Teaching Experience
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="e.g., 5 years"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {/* Parent-specific fields */}
              {formData.role === 'parent' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Children Information
                  </label>
                  <textarea
                    value={formData.children}
                    onChange={(e) => setFormData({...formData, children: e.target.value})}
                    placeholder="Please provide information about your children (names, ages, schools)"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 