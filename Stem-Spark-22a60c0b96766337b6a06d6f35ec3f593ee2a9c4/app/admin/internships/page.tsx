"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createInternship } from "@/lib/internship-actions"
import { supabase } from "@/lib/supabase"
import { Plus, Edit, Trash2, Users, Calendar } from "lucide-react"
import Link from "next/link"
import AdminLayout from '../layout'
import { motion } from "framer-motion"

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
  created_at: string
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    const { data, error } = await supabase.from("internships").select("*").order("created_at", { ascending: false })

    if (data) {
      setInternships(data)
    }
  }

  const handleCreateInternship = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const result = await createInternship(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({ type: "success", text: "Internship created successfully!" })
      setIsCreateDialogOpen(false)
      fetchInternships()
    }

    setIsLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-8 p-2 sm:p-4 lg:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Internships</h1>
              <p className="text-gray-600">Create and manage internship opportunities for students.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Refresh
              </Button>
            </div>
          </div>
        </motion.header>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {internships.map((internship) => (
            <Card key={internship.id} className="border-0 shadow-md rounded-lg bg-white">
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold mb-0 truncate">{internship.title}</CardTitle>
                    <Badge className={internship.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{internship.status}</Badge>
                  </div>
                  <CardDescription className="text-xs text-gray-500 truncate">
                    {internship.company}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span>{internship.current_participants}/{internship.max_participants} participants</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}
