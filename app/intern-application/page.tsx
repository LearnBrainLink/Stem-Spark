'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApplicationData {
  fullName: string
  email: string
  phone: string
  grade: string
  school: string
  bio: string
  specialties: string[]
  experience: string
  motivation: string
  availability: string
}

export default function InternApplication() {
  const [formData, setFormData] = useState<ApplicationData>({
    fullName: '',
    email: '',
    phone: '',
    grade: '',
    school: '',
    bio: '',
    specialties: [],
    experience: '',
    motivation: '',
    availability: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      // Insert application into database
      const { data, error } = await supabase
        .from('intern_applications')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            grade: parseInt(formData.grade),
            school: formData.school,
            bio: formData.bio,
            specialties: formData.specialties,
            experience: formData.experience,
            motivation: formData.motivation,
            availability: formData.availability,
            status: 'pending'
          }
        ])

      if (error) throw error

      setMessage('Application submitted successfully! We will review and get back to you soon.')
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        grade: '',
        school: '',
        bio: '',
        specialties: [],
        experience: '',
        motivation: '',
        availability: ''
      })
    } catch (error) {
      setMessage('Error submitting application. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-8">Intern Application</h1>
          
          {message && (
            <div className={`p-4 rounded-md mb-6 ${
              message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Grade *
              </label>
              <select
                required
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Grade</option>
                {[9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School *
              </label>
              <input
                type="text"
                required
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio *
              </label>
              <textarea
                required
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                STEM Specialties (Select all that apply)
              </label>
              <div className="space-y-2">
                {['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Engineering', 'Robotics', 'Data Science'].map(specialty => (
                  <label key={specialty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="mr-2"
                    />
                    {specialty}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Experience
              </label>
              <textarea
                rows={3}
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any relevant experience..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivation for Joining *
              </label>
              <textarea
                required
                rows={3}
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Why do you want to join NovaKinetix Academy as an intern?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability *
              </label>
              <textarea
                required
                rows={2}
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="When are you available to volunteer?"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 