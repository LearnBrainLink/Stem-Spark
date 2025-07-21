'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  grade: string
  school: string
  parentName: string
  parentEmail: string
  parentPhone: string
  relationship: string
}

export default function StudentSignup() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    grade: '',
    school: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: ''
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
            role: 'student',
          },
        },
      })

      if (authError) throw authError

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user?.id,
            full_name: formData.fullName,
            email: formData.email,
            role: 'student',
            grade: parseInt(formData.grade),
            school: formData.school,
          },
        ])

      if (profileError) throw profileError

      // Create parent relationship
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Student Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your student account
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
        </form>
      </div>
    </div>
  )
} 