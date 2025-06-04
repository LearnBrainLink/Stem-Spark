import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Mail } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { AdminSetupClient } from "./admin-setup-client"

// Define admin accounts directly in the component
const ADMIN_ACCOUNTS = [
  {
    email: "admin@stemspark.academy",
    password: "STEMAdmin2024!",
    fullName: "Dr. Sarah Johnson",
    role: "Main Administrator",
    state: "California",
  },
  {
    email: "director@stemspark.academy",
    password: "STEMDirector2024!",
    fullName: "Prof. Michael Chen",
    role: "Program Director",
    state: "New York",
  },
  {
    email: "coordinator@stemspark.academy",
    password: "STEMCoord2024!",
    fullName: "Dr. Emily Rodriguez",
    role: "Education Coordinator",
    state: "Texas",
  },
  {
    email: "manager@stemspark.academy",
    password: "STEMManager2024!",
    fullName: "Prof. David Kim",
    role: "Content Manager",
    state: "Washington",
  },
]

export default function AdminSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin Setup
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Admin Dashboard</button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Account Setup</h1>
            <p className="text-gray-600">Create and manage administrator accounts for STEM Spark Academy</p>
          </div>

          {/* Admin Accounts Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Pre-configured Admin Accounts
              </CardTitle>
              <CardDescription>
                The following admin accounts will be created with full administrative privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {ADMIN_ACCOUNTS.map((admin, index) => (
                  <div key={admin.email} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{admin.fullName}</h4>
                        <p className="text-sm text-gray-600">{admin.role}</p>
                      </div>
                      <Badge variant="outline">{admin.state}</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <code className="bg-white px-2 py-1 rounded text-xs">{admin.email}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <code className="bg-white px-2 py-1 rounded text-xs">{admin.password}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Component for Interactive Features */}
          <AdminSetupClient adminAccounts={ADMIN_ACCOUNTS} />

          {/* Important Notes */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Important Security Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-yellow-700">
              <ul className="space-y-2 text-sm">
                <li>• Save these credentials securely - they provide full administrative access</li>
                <li>• Change passwords after first login for enhanced security</li>
                <li>• Each admin account has access to all platform features</li>
                <li>• Admin accounts can manage users, internships, videos, and applications</li>
                <li>• Use different accounts for different team members</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
