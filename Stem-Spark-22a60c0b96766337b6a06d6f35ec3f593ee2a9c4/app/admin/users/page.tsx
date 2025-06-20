"use client"

import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase"
import { Search, Plus, Edit, Trash2, Users, Download, UserCheck, UserX, GraduationCap, Mail, Calendar, Eye, MoreHorizontal, RefreshCw, Shield } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from "@/components/ui/skeleton"
import { getUsersData } from '../actions'
import AdminLayout from '../layout'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  grade?: number
  school_name?: string
  country?: string
  state?: string
  email_verified: boolean
  created_at: string
  last_sign_in_at?: string
  status: 'active' | 'inactive' | 'pending'
}

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  teacher: 'bg-blue-100 text-blue-800 border-blue-200',
  student: 'bg-green-100 text-green-800 border-green-200',
  parent: 'bg-purple-100 text-purple-800 border-purple-200',
}

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getUsersData()
      
      if (result.error) {
        setError(result.error)
      } else if (result.users) {
        // Add mock status for demo purposes
        const usersWithStatus = result.users.map((user: any) => ({
          ...user,
          status: Math.random() > 0.1 ? 'active' : (Math.random() > 0.5 ? 'pending' : 'inactive') as 'active' | 'inactive' | 'pending'
        }))
        setUsers(usersWithStatus)
      }
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.school_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async (formData: FormData) => {
    try {
      const userData = {
        email: formData.get("email") as string,
        full_name: formData.get("fullName") as string,
        role: formData.get("role") as string,
        grade: formData.get("grade") ? Number(formData.get("grade")) : null,
        school_name: formData.get("schoolName") as string,
        country: formData.get("country") as string,
        state: formData.get("state") as string,
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: "TempPassword123!",
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
        },
      })

      if (authError) throw authError

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        ...userData,
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) throw profileError

      setMessage({ type: "success", text: "User created successfully!" })
      setIsCreateDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create user" })
    }
  }

  const handleUpdateUser = async (formData: FormData) => {
    if (!editingUser) return

    try {
      const userData = {
        full_name: formData.get("fullName") as string,
        role: formData.get("role") as string,
        grade: formData.get("grade") ? Number(formData.get("grade")) : null,
        school_name: formData.get("schoolName") as string,
        country: formData.get("country") as string,
        state: formData.get("state") as string,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from("profiles").update(userData).eq("id", editingUser.id)

      if (error) throw error

      setMessage({ type: "success", text: "User updated successfully!" })
      setEditingUser(null)
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update user" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError

      // Delete profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (profileError) throw profileError

      setMessage({ type: "success", text: "User deleted successfully!" })
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete user" })
    }
  }

  const exportUsers = () => {
    const csv = [
      ["Name", "Email", "Role", "Grade", "School", "Country", "State", "Verified", "Created"],
      ...filteredUsers.map((user) => [
        user.full_name || "",
        user.email,
        user.role,
        user.grade?.toString() || "",
        user.school_name || "",
        user.country || "",
        user.state || "",
        user.email_verified ? "Yes" : "No",
        new Date(user.created_at).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "intern":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      case "parent":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const UserCard = ({ user, index }: { user: User; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">{user.full_name}</h3>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </p>
                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(user.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
                {user.role}
              </Badge>
              <Badge className={statusColors[user.status]}>
                {user.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const UserCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <motion.div 
        className="space-y-6 p-2 sm:p-4 lg:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--novakinetix-dark)]">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all user accounts, roles, and permissions across the platform.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={fetchUsers}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button className="bg-[var(--novakinetix-primary)] hover:bg-[var(--novakinetix-accent)]">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Admins</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md border-0 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {users.filter(u => u.status === 'pending').length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-md border-0 bg-gradient-to-br from-white to-gray-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <UserX className="w-5 h-5 text-red-600" />
                  <p className="text-red-600 font-medium">Error Loading Users</p>
                </div>
                <p className="text-red-600 text-sm mb-4">{error}</p>
                <Button onClick={fetchUsers} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <UserCardSkeleton key={index} index={index} />
                ))
              ) : filteredUsers.length === 0 ? (
                <Card className="border-gray-200 bg-gray-50">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">No users found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user, index) => (
                    <UserCard key={user.id} user={user} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AdminLayout>
  )
}
