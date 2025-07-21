import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Image
                src="/images/novakinetix-logo.png"
                alt="NOVAKINETIX ACADEMY Logo"
                width={50}
                height={50}
                className="mr-3"
              />
              <span className="text-2xl font-bold text-gray-900">NovaKinetix Academy</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/intern-application" className="text-gray-700 hover:text-blue-600">
                Apply as Intern
              </Link>
              <Link href="/student-signup" className="text-gray-700 hover:text-blue-600">
                Student Signup
              </Link>
              <Link href="/parent-signup" className="text-gray-700 hover:text-blue-600">
                Parent Signup
              </Link>
              <Link href="/communication-hub" className="text-gray-700 hover:text-blue-600">
                Communication Hub
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to NovaKinetix Academy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering Future Innovators through cutting-edge STEM education
          </p>
          
          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Intern Applications</h3>
              <p className="text-gray-600 mb-4">
                Join our team as an intern and gain valuable experience while contributing to our mission.
              </p>
              <Link 
                href="/intern-application"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Apply Now
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Student Registration</h3>
              <p className="text-gray-600 mb-4">
                Register as a student to access our educational programs and resources.
              </p>
              <Link 
                href="/student-signup"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
              >
                Register
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Parent Portal</h3>
              <p className="text-gray-600 mb-4">
                Connect with teachers and monitor your child's progress through our parent portal.
              </p>
              <Link 
                href="/parent-signup"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 