import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/admin/applications" className="text-gray-700 hover:text-blue-600">
                Applications
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-blue-600">
                Users
              </Link>
              <Link href="/admin/messaging" className="text-gray-700 hover:text-blue-600">
                Messaging
              </Link>
              <Link href="/admin/analytics" className="text-gray-700 hover:text-blue-600">
                Analytics
              </Link>
              <Link href="/admin/monitoring" className="text-gray-700 hover:text-blue-600">
                Monitoring
              </Link>
              <Link href="/admin/security" className="text-gray-700 hover:text-blue-600">
                Security
              </Link>
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Back to Site
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 