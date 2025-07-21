'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Child {
  name: string
  grade: string
  school: string
}

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  children: Child[]
}

export default function ParentSignup() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    children: [{ name: '', grade: '', school: '' }]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleChildChange = (index: number, field: keyof Child, value: string) => {
    const newChildren = [...formData.children]
    newChildren[index] = { ...newChildren[index], [field]: value }
    setFormData({ ...formData, children: newChildren })
  }

  const addChild = () => {
    setFormData({
      ...formData,
      children: [...formData.children, { name: '', grade: '', school: '' }]
    })
  }

  const removeChild = (index: number) => {
    if (formData.children.length > 1) {
      const newChildren = formData.children.filter((_, i) => i !== index)
      setFormData({ ...formData, children: newChildren })
    }
  }

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
            role: 'parent',
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
            role: 'parent',
            phone: formData.phone,
          },
        ])

      if (profileError) throw profileError

      // Create children records
      const childrenData = formData.children
        .filter(child => child.name && child.grade && child.school)
        .map(child => ({
          parent_id: authData.user?.id,
          child_name: child.name,
          child_grade: parseInt(child.grade),
          child_school: child.school,
        }))

      if (childrenData.length > 0) {
        const { error: childrenError } = await supabase
          .from('parent_children')
          .insert(childrenData)

        if (childrenError) throw childrenError
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Parent Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your parent account
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
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Children *
              </label>
              {formData.children.map((child, index) => (
                <div key={index} className="mt-2 p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Child {index + 1}</span>
                    {formData.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Child's Name"
                      value={child.name}
                      onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={child.grade}
                      onChange={(e) => handleChildChange(index, 'grade', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Grade</option>
                      {[9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="School"
                      value={child.school}
                      onChange={(e) => handleChildChange(index, 'school', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addChild}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                + Add Another Child
              </button>
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