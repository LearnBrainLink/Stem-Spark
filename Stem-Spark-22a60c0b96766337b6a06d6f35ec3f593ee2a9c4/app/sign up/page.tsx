"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { enhancedSignUp } from "@/lib/enhanced-auth-actions" // Using the enhanced action
import { Mail, Lock, User, CheckCircle, Loader2, ArrowLeft, School, Map, Globe, UserSquare } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function SignUpPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState("")

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await enhancedSignUp(formData)

      if (result?.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result?.success) {
        setMessage({
          type: "success",
          text: result.message || "Account created successfully! Please check your email to verify your account.",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      setMessage({
        type: "error",
        text: "An unexpected error occurred during signup. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Logo width={160} height={80} />
          </Link>
          <p className="text-lg text-gray-700">Join our community of young engineers!</p>
        </div>

        <Card className="shadow-2xl border-0 rounded-2xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl text-center text-blue-800">Create Your Account</CardTitle>
            <CardDescription className="text-center text-lg text-gray-600">
              Start your STEM journey with Novakinetix Academy
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            {message && (
              <Alert
                className={`mb-6 ${
                  message.type === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-green-300 bg-green-50 text-green-800"
                }`}
              >
                <AlertDescription className="font-medium flex items-center gap-2">
                  {message.type === "success" && <CheckCircle className="w-5 h-5" />}
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form action={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">I am a... *</Label>
                <Select name="role" required onValueChange={setSelectedRole} disabled={isLoading}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input id="signup-name" name="fullName" type="text" placeholder="Your full name" className="pl-10 h-12 text-base" required disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input id="signup-email" name="email" type="email" placeholder="your@email.com" className="pl-10 h-12 text-base" required disabled={isLoading} />
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input id="signup-password" name="password" type="password" placeholder="••••••••" className="pl-10 h-12 text-base" minLength={8} required disabled={isLoading} />
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 characters</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <Input id="confirm-password" name="confirmPassword" type="password" placeholder="••••••••" className="pl-10 h-12 text-base" minLength={8} required disabled={isLoading}/>
                    </div>
                  </div>
              </div>

              {selectedRole === 'student' && (
                <>
                  <div className="border-t pt-6 space-y-6">
                     <h3 className="text-xl font-semibold text-blue-700">Student Information</h3>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade Level *</Label>
                          <Select name="grade" required>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select your grade" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5th Grade</SelectItem>
                                <SelectItem value="6">6th Grade</SelectItem>
                                <SelectItem value="7">7th Grade</SelectItem>
                                <SelectItem value="8">8th Grade</SelectItem>
                              </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="schoolName">School Name</Label>
                            <div className="relative">
                               <School className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                               <Input id="schoolName" name="schoolName" type="text" placeholder="Your school's name" className="pl-10 h-12 text-base" disabled={isLoading} />
                            </div>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="country">Country *</Label>
                            <div className="relative">
                               <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                               <Input id="country" name="country" type="text" placeholder="e.g. United States" className="pl-10 h-12 text-base" required disabled={isLoading} />
                            </div>
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="state">State/Province *</Label>
                            <div className="relative">
                               <Map className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                               <Input id="state" name="state" type="text" placeholder="e.g. California" className="pl-10 h-12 text-base" required disabled={isLoading} />
                            </div>
                        </div>
                     </div>
                  </div>
                  <div className="border-t pt-6 space-y-6">
                     <h3 className="text-xl font-semibold text-blue-700">Parent/Guardian Information</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                            <div className="relative">
                               <UserSquare className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                               <Input id="parentName" name="parentName" type="text" placeholder="Parent's full name" className="pl-10 h-12 text-base" required disabled={isLoading} />
                            </div>
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
                           <div className="relative">
                               <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                               <Input id="parentEmail" name="parentEmail" type="email" placeholder="parent@email.com" className="pl-10 h-12 text-base" required disabled={isLoading} />
                           </div>
                         </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
                           <Input id="parentPhone" name="parentPhone" type="tel" placeholder="(555) 123-4567" className="h-12 text-base" disabled={isLoading} />
                         </div>
                         <div className="space-y-2">
                           <Label htmlFor="relationship">Relationship to Student *</Label>
                           <Select name="relationship" required>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="guardian">Guardian</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                           </Select>
                         </div>
                      </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-14 text-lg font-bold shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center pt-2">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="underline text-blue-600">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline text-blue-600">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/login" className="text-sm text-gray-700 hover:text-blue-700 transition-colors inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
