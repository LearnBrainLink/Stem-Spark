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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-30 shrink-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo width={48} height={48} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Admin Setup
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">Admin Dashboard</button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="max-w-4xl mx-auto flex-1 min-h-0 flex flex-col gap-6 py-6 overflow-hidden">
          <div className="text-center mb-4 shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Admin Account Setup</h1>
            <p className="text-gray-600 text-sm md:text-base">Create and manage administrator accounts for STEM Spark Academy</p>
          </div>

          {/* Admin Accounts Overview - scrollable if needed */}
          <div className="flex-1 min-h-0 overflow-auto">
            <Card className="shadow-md border-0 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Users className="w-5 h-5" />
                  Pre-configured Admin Accounts
                </CardTitle>
                <CardDescription>
                  The following admin accounts will be created with full administrative privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {ADMIN_ACCOUNTS.map((admin) => (
                    <div key={admin.email} className="p-3 border rounded-lg bg-gray-50 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-base">{admin.fullName}</h4>
                          <p className="text-xs text-gray-600">{admin.role}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{admin.state}</Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <code className="bg-white px-2 py-1 rounded">{admin.email}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-gray-400" />
                          <code className="bg-white px-2 py-1 rounded">{admin.password}</code>
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
            <Card className="border-yellow-200 bg-yellow-50 shadow-none mt-4">
              <CardHeader>
                <CardTitle className="text-yellow-800 text-base">Important Security Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-700">
                <ul className="space-y-1 text-xs">
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
    </div>
  )
}
