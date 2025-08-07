'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Edit, 
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  Ban,
  Unlock
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
  avatar_url: string | null
  phone_number: string | null
  date_of_birth: string | null
  school_institution: string | null
  grade_level: number | null
  areas_of_interest: string[] | null
  bio: string | null
  total_volunteer_hours: number | null
  is_super_admin: boolean | null
  last_active: string | null
  status?: string
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPermissions, setUserPermissions] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: '',
    phone_number: '',
    school_institution: '',
    grade_level: '',
    bio: ''
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchUsers()
      getUserPermissions()
    }
  }, [currentUser])

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      setCurrentUser(user)
    } catch (error) {
      console.error('Error getting current user:', error)
      setError('Failed to get user information')
    }
  }

  const getUserPermissions = async () => {
    if (!currentUser) return
    
    try {
      // Simple role-based permissions check
      const permissions = {
        role: currentUser.role,
        can_edit_admins: currentUser.role === 'super_admin',
        can_delete_admins: currentUser.role === 'super_admin',
        can_change_admin_roles: currentUser.role === 'super_admin',
        can_approve_volunteer_hours: currentUser.role === 'admin' || currentUser.role === 'super_admin',
        can_manage_content: currentUser.role === 'admin' || currentUser.role === 'super_admin',
        can_view_analytics: currentUser.role === 'admin' || currentUser.role === 'super_admin',
        can_manage_applications: currentUser.role === 'admin' || currentUser.role === 'super_admin',
        can_create_restricted_channels: currentUser.role === 'admin' || currentUser.role === 'super_admin',
        can_send_announcements: currentUser.role === 'admin' || currentUser.role === 'super_admin'
      }
      setUserPermissions(permissions)
    } catch (error) {
      console.error('Error getting user permissions:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers((data as unknown as User[]) || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const canEditUser = (targetUser: User) => {
    if (!userPermissions) return false
    
    // Super admins can edit everyone except other super admins
    if (userPermissions.role === 'super_admin') {
      return !targetUser.is_super_admin
    }
    
    // Regular admins can edit non-admin users
    if (userPermissions.role === 'admin') {
      return targetUser.role !== 'admin' && !targetUser.is_super_admin
    }
    
    return false
  }

  const canDeleteUser = (targetUser: User) => {
    if (!userPermissions) return false
    
    // Super admins can delete everyone except other super admins
    if (userPermissions.role === 'super_admin') {
      return !targetUser.is_super_admin
    }
    
    // Regular admins can delete non-admin users
    if (userPermissions.role === 'admin') {
      return targetUser.role !== 'admin' && !targetUser.is_super_admin
    }
    
    return false
  }

  const canBanUser = (targetUser: User) => {
    if (!userPermissions) return false
    
    // Super admins can ban everyone except other super admins
    if (userPermissions.role === 'super_admin') {
      return !targetUser.is_super_admin
    }
    
    // Regular admins can ban non-admin users
    if (userPermissions.role === 'admin') {
      return targetUser.role !== 'admin' && !targetUser.is_super_admin
    }
    
    return false
  }

  const canChangeRole = (targetUser: User) => {
    if (!userPermissions) return false
    
    // Only super admins can change roles
    if (userPermissions.role === 'super_admin') {
      return !targetUser.is_super_admin
    }
    
    return false
  }

  const updateUser = async (userId: string, updateData: any) => {
    try {
      setActionLoading('update')
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      // Log the admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          action_type: 'edit_user',
          target_user_id: userId,
          performed_by: currentUser.id,
          is_allowed: true,
          reason: 'User profile updated by admin',
          metadata: updateData
        })

      setShowEditModal(false)
      fetchUsers()
      setActionLoading(null)
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
      setActionLoading(null)
    }
  }

  const banUser = async (userId: string, reason: string) => {
    try {
      setActionLoading('ban')
      
      // Update user status to banned
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'banned',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Log the admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          action_type: 'ban_user',
          target_user_id: userId,
          performed_by: currentUser.id,
          is_allowed: true,
          reason: reason,
          metadata: { ban_reason: reason }
        })

      setShowBanModal(false)
      setBanReason('')
      setSelectedUser(null)
      fetchUsers()
      setActionLoading(null)
    } catch (error) {
      console.error('Error banning user:', error)
      setError('Failed to ban user')
      setActionLoading(null)
    }
  }

  const unbanUser = async (userId: string) => {
    try {
      setActionLoading('unban')
      
      // Update user status to active
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Log the admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          action_type: 'unban_user',
          target_user_id: userId,
          performed_by: currentUser.id,
          is_allowed: true,
          reason: 'User unbanned by admin',
          metadata: { action: 'unban' }
        })

      fetchUsers()
      setActionLoading(null)
    } catch (error) {
      console.error('Error unbanning user:', error)
      setError('Failed to unban user')
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string, reason: string) => {
    try {
      setActionLoading('delete')
      
      // Get the user's email before deleting the profile
      const userToDelete = users.find(u => u.id === userId)
      if (!userToDelete) {
        throw new Error('User not found')
      }
      const userEmail = userToDelete.email;
      
      // Delete user from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) throw authError
      
      // Delete user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
      if (profileError) throw profileError
      
      // Delete associated data
      await supabase.from('chat_messages').delete().eq('sender_id', userId)
      await supabase.from('chat_channel_members').delete().eq('user_id', userId)
      await supabase.from('volunteer_hours').delete().eq('intern_id', userId)
      await supabase.from('tutoring_sessions').delete().eq('student_id', userId)
      await supabase.from('tutoring_sessions').delete().eq('intern_id', userId)
      await supabase.from('intern_applications').delete().eq('email', userEmail)

      // Log the admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          action_type: 'delete_user',
          target_user_id: userId,
          performed_by: currentUser.id,
          is_allowed: true,
          reason: reason,
          metadata: { delete_reason: reason }
        })

      setShowDeleteModal(false)
      setDeleteReason('')
      setSelectedUser(null)
      fetchUsers()
      setActionLoading(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user')
      setActionLoading(null)
    }
  }

  const getRoleColor = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return 'bg-purple-100 text-purple-800'
    
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'student': return 'bg-blue-100 text-blue-800'
      case 'parent': return 'bg-green-100 text-green-800'
      case 'intern': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'banned': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getRoleIcon = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return <Shield className="w-4 h-4" />
    
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'student': return <GraduationCap className="w-4 h-4" />
      case 'parent': return <Users className="w-4 h-4" />
      case 'intern': return <BookOpen className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name || '',
      role: user.role,
      phone_number: user.phone_number || '',
      school_institution: user.school_institution || '',
      grade_level: user.grade_level?.toString() || '',
      bio: user.bio || ''
    })
    setShowEditModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter || (!user.status && statusFilter === 'active')
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage all user accounts and permissions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="intern">Interns</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getRoleColor(user.role, user.is_super_admin || false)}>
                        {getRoleIcon(user.role, user.is_super_admin || false)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.grade_level && `Grade ${user.grade_level}`}
                        {user.school_institution && user.grade_level && ' • '}
                        {user.school_institution}
                      </div>
                      {user.phone_number && (
                        <div className="text-sm text-gray-500">
                          {user.phone_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {canEditUser(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(user)}
                            disabled={actionLoading !== null}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {canBanUser(user) && (
                          user.status === 'banned' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => unbanUser(user.id)}
                              disabled={actionLoading !== null}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowBanModal(true)
                              }}
                              disabled={actionLoading !== null}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Ban
                            </Button>
                          )
                        )}
                        {canDeleteUser(user) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowDeleteModal(true)
                            }}
                            disabled={actionLoading !== null}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                        {!canEditUser(user) && !canBanUser(user) && !canDeleteUser(user) && (
                          <div className="flex items-center text-gray-400">
                            <Shield className="w-4 h-4 mr-1" />
                            Protected
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => !u.status || u.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Banned Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'banned').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ban User Dialog */}
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Ban className="w-5 h-5 mr-2 text-red-600" />
              Ban User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to ban {selectedUser?.full_name}? This will prevent them from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Ban</label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBanModal(false)
                  setBanReason('')
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && banUser(selectedUser.id, banReason)}
                disabled={!banReason.trim() || actionLoading !== null}
              >
                <Ban className="w-4 h-4 mr-2" />
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Delete User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedUser?.full_name}? This action cannot be undone and will remove all their data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Deletion</label>
              <Textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter the reason for deleting this user..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteReason('')
                  setSelectedUser(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedUser && deleteUser(selectedUser.id, deleteReason)}
                disabled={!deleteReason.trim() || actionLoading !== null}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


