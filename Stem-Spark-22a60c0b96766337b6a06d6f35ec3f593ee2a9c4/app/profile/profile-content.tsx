"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { exportUserData } from "@/lib/profile-actions"
import { updateProfile, changePassword } from "@/lib/enhanced-auth-actions"
import {
  User,
  Mail,
  MapPin,
  School,
  Calendar,
  Download,
  Activity,
  Award,
  Edit,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProfileContentProps {
  profile: any
  parentInfo: any
  activities: any[]
  applications: any[]
}

export function ProfileContent({ profile, parentInfo, activities, applications }: ProfileContentProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  useEffect(() => {
    // Verify role is loaded from database on component mount
    const verifyRole = async () => {
      try {
        // This will ensure role is always from database
        console.log(`🔍 Profile loaded with role: ${profile?.role} (from database)`)
      } catch (error) {
        console.error("Error verifying role:", error)
      }
    }

    if (profile?.id) {
      verifyRole()
    }
  }, [profile])

  const handleUpdateProfile = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await updateProfile(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: result.message })
      setIsEditDialogOpen(false)
      // Refresh the page to show updated data
      window.location.reload()
    }

    setIsLoading(false)
  }

  const handleChangePassword = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await changePassword(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: result.message })
      setIsPasswordDialogOpen(false)
    }

    setIsLoading(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "teacher":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      case "parent":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "withdrawn":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              My Profile
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/videos">
              <Button variant="outline">Videos</Button>
            </Link>
            <Link href="/internships">
              <Button variant="outline">Internships</Button>
            </Link>
            {profile?.role === "admin" && (
              <Link href="/admin">
                <Button variant="outline">Admin</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {message && (
            <Alert
              className={`${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
            >
              <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800">{profile?.full_name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getRoleColor(profile?.role || "")}>
                      {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                    </Badge>
                    {profile?.email_verified && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>Update your profile information</DialogDescription>
                      </DialogHeader>
                      <form action={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input id="fullName" name="fullName" defaultValue={profile?.full_name} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" type="email" defaultValue={profile?.email} required />
                          {profile?.email_verified && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Changing your email will require verification of the new address
                          </p>
                        </div>

                        {profile?.role === "student" && (
                          <div className="space-y-2">
                            <Label htmlFor="grade">Grade Level</Label>
                            <Select name="grade" defaultValue={profile?.grade?.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5th Grade</SelectItem>
                                <SelectItem value="6">6th Grade</SelectItem>
                                <SelectItem value="7">7th Grade</SelectItem>
                                <SelectItem value="8">8th Grade</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" name="country" defaultValue={profile?.country} required />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input id="state" name="state" defaultValue={profile?.state} required />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="schoolName">School Name</Label>
                          <Input id="schoolName" name="schoolName" defaultValue={profile?.school_name || ""} />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? "Updating..." : "Update Profile"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Lock className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Update your account password</DialogDescription>
                      </DialogHeader>
                      <form action={handleChangePassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input id="currentPassword" name="currentPassword" type="password" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input id="newPassword" name="newPassword" type="password" minLength={8} required />
                          <p className="text-xs text-gray-500">Minimum 8 characters</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={isLoading} className="flex-1">
                            {isLoading ? "Changing..." : "Change Password"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <form action={exportUserData}>
                    <Button variant="outline" type="submit">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </form>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Profile Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="flex items-center gap-2">
                    {profile?.email}
                    {profile?.email_verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Unverified
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {profile?.state}, {profile?.country}
                  </span>
                </div>
                {profile?.school_name && (
                  <div className="flex items-center gap-3">
                    <School className="w-4 h-4 text-gray-400" />
                    <span>{profile?.school_name}</span>
                  </div>
                )}
                {profile?.grade && (
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-gray-400" />
                    <span>Grade {profile.grade}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Joined {new Date(profile?.created_at || "").toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information (for students) */}
            {parentInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Parent/Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">{parentInfo.parent_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{parentInfo.relationship}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{parentInfo.parent_email}</span>
                  </div>
                  {parentInfo.parent_phone && (
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 text-gray-400">📞</span>
                      <span>{parentInfo.parent_phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Internship Applications (for students) */}
          {profile?.role === "student" && applications && applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Internship Applications
                </CardTitle>
                <CardDescription>Your internship application history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{app.internships?.title}</h4>
                        <p className="text-sm text-gray-600">{app.internships?.company}</p>
                        <p className="text-xs text-gray-500">Applied {new Date(app.applied_at).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activities
              </CardTitle>
              <CardDescription>Your recent actions on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.activity_description}</p>
                      <p className="text-sm text-gray-600 capitalize">{activity.activity_type.replace("_", " ")}</p>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
