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
import { Search, Plus, Edit, Trash2, Users, Download, UserCheck, UserX, GraduationCap, Mail, Calendar, Eye, MoreHorizontal, RefreshCw, Shield, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from "@/components/ui/skeleton"
import { getEnhancedUsersData, createUser, updateUser, deleteUser } from '../enhanced-actions'

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
      
      const result = await getEnhancedUsersData()
      
      if (result.error) {
        setError(result.error)
      } else if (result.users) {
        setUsers(result.users)
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

      const result = await createUser(userData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "User created successfully!" })
        setIsCreateDialogOpen(false)
        fetchUsers()
      }
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
      }

      const result = await updateUser(editingUser.id, userData)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "User updated successfully!" })
        setEditingUser(null)
        fetchUsers()
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to update user" })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const result = await deleteUser(userId)

      if (result.error) {
        setMessage({ type: "error", text: result.error })
      } else {
        setMessage({ type: "success", text: "User deleted successfully!" })
        fetchUsers()
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to delete user" })
    }
  }

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'School', 'Country', 'Status', 'Created'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email,
        user.role,
        user.school_name || '',
        user.country || '',
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users-export.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getRoleBadgeColor = (role: string) => {
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusBadgeColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const UserCard = ({ user, index }: { user: User; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{user.full_name || 'No Name'}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge className={`text-xs px-2 py-1 ${getRoleBadgeColor(user.role)}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
            <Badge className={`text-xs px-2 py-1 ${getStatusBadgeColor(user.status)}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-400" />
            <span className="truncate">{user.school_name || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span>{user.email_verified ? 'Verified' : 'Not Verified'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Joined: {formatDate(user.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span>Last seen: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'N/A'}</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(user.id)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </motion.div>
  );

  const UserCardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">User Management</h1>
            <p className="text-gray-600">Manage all users and their permissions.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[hsl(var(--novakinetix-primary))] text-white hover:bg-[hsl(var(--novakinetix-dark))]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>Add a new user to the platform.</DialogDescription>
                </DialogHeader>
                <form action={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" name="fullName" required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input id="schoolName" name="schoolName" />
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">Create User</Button>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.header>

      {/* Message Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div>
          <Label htmlFor="search">Search Users</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by name, email, or school..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="role-filter">Filter by Role</Label>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="teacher">Teachers</SelectItem>
              <SelectItem value="parent">Parents</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status-filter">Filter by Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Users Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <UserCardSkeleton key={i} index={i} />
          ))}
        </div>
      ) : error ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
        </motion.div>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information.</DialogDescription>
            </DialogHeader>
            <form action={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input id="edit-fullName" name="fullName" defaultValue={editingUser.full_name} required />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editingUser.role} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-schoolName">School Name</Label>
                <Input id="edit-schoolName" name="schoolName" defaultValue={editingUser.school_name} />
              </div>
              <div className="flex gap-4">
                <Button type="submit" className="flex-1">Update User</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
