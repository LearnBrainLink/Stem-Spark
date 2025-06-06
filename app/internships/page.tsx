"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { simpleApplyToInternship, simpleWithdrawApplication } from "@/lib/simple-internship-actions"
import { Building2, Calendar, MapPin, Users, Clock, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { BrandedImage } from "@/components/branded-image"

interface Internship {
  id: string
  title: string
  description: string
  company: string
  location: string
  duration: string
  requirements: string
  application_deadline: string
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  status: string
}

interface Application {
  id: string
  internship_id: string
  status: string
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [applicationTexts, setApplicationTexts] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsPageLoading(true)
    await Promise.all([loadInternships(), loadUser()])
    setIsPageLoading(false)
  }

  const loadUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        await loadApplications(user.id)
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }
  }

  const loadInternships = async () => {
    try {
      const { data, error } = await supabase
        .from("internships")
        .select("*")
        .eq("status", "active")
        .order("application_deadline", { ascending: true })

      if (error) {
        console.error("Error loading internships:", error)
        return
      }

      setInternships(data || [])
    } catch (error) {
      console.error("Error loading internships:", error)
    }
  }

  const loadApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("internship_applications")
        .select("id, internship_id, status")
        .eq("student_id", userId)

      if (error) {
        console.error("Error loading applications:", error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error("Error loading applications:", error)
    }
  }

  const handleApply = async (internshipId: string) => {
    const text = applicationTexts[internshipId]
    if (!text || text.trim().length === 0) {
      setMessage({ type: "error", text: "Please enter your application text" })
      return
    }

    setIsLoading(true)
    setProcessingId(internshipId)
    setMessage(null)

    try {
      const result = await simpleApplyToInternship(internshipId, text.trim())

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.message || "Application submitted successfully!" })
        setApplicationTexts((prev) => ({ ...prev, [internshipId]: "" }))
        setShowApplicationForm(null)
        await loadData()
      }
    } catch (error) {
      console.error("Apply error:", error)
      setMessage({ type: "error", text: "Failed to submit application. Please try again." })
    } finally {
      setIsLoading(false)
      setProcessingId(null)
    }
  }

  const handleWithdraw = async (applicationId: string) => {
    setIsLoading(true)
    setProcessingId(applicationId)
    setMessage(null)

    try {
      const result = await simpleWithdrawApplication(applicationId)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else if (result.success) {
        setMessage({ type: "success", text: result.message || "Application withdrawn successfully!" })
        await loadData()
      }
    } catch (error) {
      console.error("Withdraw error:", error)
      setMessage({ type: "error", text: "Failed to withdraw application. Please try again." })
    } finally {
      setIsLoading(false)
      setProcessingId(null)
    }
  }

  const getApplication = (internshipId: string) => {
    return applications.find((app) => app.internship_id === internshipId)
  }

  const filteredInternships = internships.filter(
    (internship) =>
      internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-600">Loading internships...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Logo width={40} height={40} variant="with-text" showText />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            {!user && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 brand-text-gradient">STEM Internships</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing internship opportunities to gain real-world experience in STEM fields through STEM Spark
            Academy
          </p>
        </div>

        <div className="max-w-4xl mx-auto mt-8">
          <BrandedImage
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
            alt="Students participating in STEM internships at STEM Spark Academy"
            width={800}
            height={300}
            className="rounded-2xl shadow-xl"
            showBranding={true}
            brandingPosition="bottom-left"
          />
        </div>

        {/* Login Required Message */}
        {!user && (
          <Alert className="mb-6 max-w-2xl mx-auto border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-blue-700">
              Please{" "}
              <Link href="/login" className="underline font-medium">
                log in
              </Link>{" "}
              to apply for internships.
            </AlertDescription>
          </Alert>
        )}

        {/* Status Message */}
        {message && (
          <Alert
            className={`mb-6 max-w-2xl mx-auto ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search internships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Internships Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredInternships.map((internship) => {
            const application = getApplication(internship.id)
            const isDeadlinePassed = new Date(internship.application_deadline) < new Date()
            const isFull = internship.current_participants >= internship.max_participants
            const isProcessing = processingId === internship.id || processingId === application?.id
            const showForm = showApplicationForm === internship.id

            return (
              <Card key={internship.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{internship.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Building2 className="w-4 h-4" />
                        {internship.company}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {internship.location}
                      </div>
                    </div>
                    {application && (
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "pending"
                              ? "secondary"
                              : application.status === "rejected"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {application.status}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">{internship.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Duration: {internship.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Deadline: {formatDate(internship.application_deadline)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>
                        {internship.current_participants}/{internship.max_participants} participants
                      </span>
                    </div>
                  </div>

                  {/* Application Form */}
                  {showForm && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="mb-3">
                        <h4 className="font-semibold mb-2">Requirements:</h4>
                        <p className="text-sm text-gray-600 mb-3">{internship.requirements}</p>
                      </div>
                      <div className="mb-3">
                        <label className="block text-sm font-medium mb-2">
                          Why are you interested in this internship? *
                        </label>
                        <Textarea
                          placeholder="Tell us about your interest, relevant experience, and what you hope to learn..."
                          value={applicationTexts[internship.id] || ""}
                          onChange={(e) =>
                            setApplicationTexts((prev) => ({ ...prev, [internship.id]: e.target.value }))
                          }
                          rows={4}
                          className="w-full"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApply(internship.id)}
                          disabled={isProcessing || !applicationTexts[internship.id]?.trim()}
                          className="flex-1"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Application"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowApplicationForm(null)
                            setApplicationTexts((prev) => ({ ...prev, [internship.id]: "" }))
                          }}
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!showForm && (
                    <div className="flex gap-2">
                      {!application ? (
                        <Button
                          className="flex-1"
                          disabled={isDeadlinePassed || isFull || !user || isProcessing}
                          onClick={() => {
                            if (!user) {
                              window.location.href = "/login"
                              return
                            }
                            setShowApplicationForm(internship.id)
                            setMessage(null)
                          }}
                        >
                          {!user
                            ? "Login to Apply"
                            : isDeadlinePassed
                              ? "Deadline Passed"
                              : isFull
                                ? "Full"
                                : "Apply Now"}
                        </Button>
                      ) : application.status === "pending" ? (
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleWithdraw(application.id)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Withdrawing...
                            </>
                          ) : (
                            "Withdraw Application"
                          )}
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          {application.status === "approved"
                            ? "Accepted"
                            : application.status === "rejected"
                              ? "Not Selected"
                              : "Applied"}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredInternships.length === 0 && (
          <div className="text-center py-12">
            <Logo width={80} height={80} className="mx-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-lg">No internships found.</p>
            <p className="text-sm text-gray-400 mt-2">STEM Spark Academy</p>
          </div>
        )}
      </div>
    </div>
  )
}
