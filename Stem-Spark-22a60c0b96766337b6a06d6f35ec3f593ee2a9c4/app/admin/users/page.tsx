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
        password: formData.get("password") as string,
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
      className="user-card bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Header Section with Profile Circle */}
      <div className="user-card-header p-5 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="profile-circle">
            {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 user-info-text" title={user.full_name || 'No Name'}>
              {user.full_name || 'No Name'}
            </h3>
            <p className="text-gray-600 text-sm mb-2 user-info-text" title={user.email}>
              {user.email}
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge className={`user-badge ${getRoleBadgeColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <Badge className={`user-badge ${getStatusBadgeColor(user.status)}`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="user-card-content px-5 pb-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2 min-h-[20px]">
            <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 user-info-text" title={user.school_name || 'No school specified'}>
              {user.school_name || 'No school specified'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 min-h-[20px]">
            <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              {user.email_verified ? 'Email Verified' : 'Not Verified'}
            </span>
          </div>
          
          {user.grade && (
            <div className="flex items-center gap-2 min-h-[20px]">
              <div className="w-4 h-4 flex items-center justify-center text-gray-400 flex-shrink-0">
                <span className="text-xs font-bold">#</span>
              </div>
              <span className="text-gray-600">Grade: {user.grade}</span>
            </div>
          )}
          
          {(user.country || user.state) && (
            <div className="flex items-center gap-2 min-h-[20px]">
              <div className="w-4 h-4 flex items-center justify-center text-gray-400 flex-shrink-0">
                🌍
              </div>
              <span className="text-gray-600 user-info-text" title={[user.state, user.country].filter(Boolean).join(', ')}>
                {[user.state, user.country].filter(Boolean).join(', ') || 'Location not specified'}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 min-h-[20px]">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 text-xs">
              Joined: {formatDate(user.created_at)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 min-h-[20px]">
            <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 text-xs">
              Last: {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Section */}
      <div className="user-card-actions bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setEditingUser(user)} 
          className="hover:bg-blue-50 hover:text-blue-700 text-gray-600"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50" 
          onClick={() => handleDeleteUser(user.id)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
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
      className="user-card bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Header Section */}
      <div className="user-card-header p-5 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-1.5 mt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="user-card-content px-5 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      
      {/* Action Section */}
      <div className="user-card-actions bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </motion.div>
  );

  return (
    <div className="admin-page-content space-y-6 p-0 m-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users, roles, and permissions</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with appropriate role and permissions.
                </DialogDescription>
              </DialogHeader>
              <form action={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required placeholder="Enter user password" />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input id="schoolName" name="schoolName" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade (for students)</Label>
                  <Input id="grade" name="grade" type="number" min="1" max="12" />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Create User</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={exportUsers} className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="parent">Parents</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message Display */}
      {message && (
        <Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Grid */}
      {isLoading ? (
        <div className="user-card-grid">
          {Array.from({ length: 8 }).map((_, index) => (
            <UserCardSkeleton key={index} index={index} />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="user-card-grid">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find users.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <form action={handleUpdateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Full Name</Label>
                <Input id="edit-fullName" name="fullName" defaultValue={editingUser.full_name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editingUser.role} required>
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
              <div className="space-y-2">
                <Label htmlFor="edit-schoolName">School Name</Label>
                <Input id="edit-schoolName" name="schoolName" defaultValue={editingUser.school_name || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input id="edit-country" name="country" defaultValue={editingUser.country || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input id="edit-state" name="state" defaultValue={editingUser.state || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade">Grade (for students)</Label>
                <Input id="edit-grade" name="grade" type="number" min="1" max="12" defaultValue={editingUser.grade || ''} />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Update User</Button>
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


