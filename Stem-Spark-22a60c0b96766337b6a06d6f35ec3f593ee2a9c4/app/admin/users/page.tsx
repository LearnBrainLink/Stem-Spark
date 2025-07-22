'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  BookOpen
} from 'lucide-react'
import { adminProtectionService } from '@/lib/admin-protection'

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    role: '',
    phone_number: '',
    school_institution: '',
    grade_level: '',
    bio: ''
  })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
      const result = await adminProtectionService.getUserPermissions(currentUser.id)
      if (result.success && result.permissions) {
        setUserPermissions(result.permissions)
      }
    } catch (error) {
      console.error('Error getting user permissions:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const canEditUser = (targetUser: User) => {
    if (!currentUser || !userPermissions) return false
    
    // Super admins can edit anyone
    if (userPermissions.role === 'super_admin') return true
    
    // Regular admins cannot edit other admins or super admins
    if (targetUser.role === 'admin' || targetUser.is_super_admin) {
      return false
    }
    
    // Admins can edit non-admin users
    return userPermissions.role === 'admin'
  }

  const canDeleteUser = (targetUser: User) => {
    if (!currentUser || !userPermissions) return false
    
    // Super admins can delete anyone except themselves
    if (userPermissions.role === 'super_admin' && targetUser.id !== currentUser.id) {
      return true
    }
    
    // Regular admins cannot delete anyone
    return false
  }

  const canChangeRole = (targetUser: User) => {
    if (!currentUser || !userPermissions) return false
    
    // Super admins can change any role
    if (userPermissions.role === 'super_admin') return true
    
    // Regular admins cannot change roles
    return false
  }

  const updateUser = async (userId: string, updateData: any) => {
    if (!currentUser) return

    try {
      setActionLoading(userId)

      // Check if user can perform this action
      const canPerform = await adminProtectionService.canPerformAdminAction(
        currentUser.id,
        'edit_user',
        userId
      )

      if (!canPerform.success || !canPerform.allowed) {
        setError(canPerform.reason || 'You do not have permission to edit this user')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, ...updateData } : user
        )
      )

      setShowEditModal(false)
      setSelectedUser(null)

    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!currentUser) return

    try {
      setActionLoading(userId)

      // Check if user can perform this action
      const canPerform = await adminProtectionService.canPerformAdminAction(
        currentUser.id,
        'delete_user',
        userId
      )

      if (!canPerform.success || !canPerform.allowed) {
        setError(canPerform.reason || 'You do not have permission to delete this user')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId))

    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user')
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleColor = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return 'bg-purple-100 text-purple-800 border-purple-200'
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'intern': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'student': return 'bg-green-100 text-green-800 border-green-200'
      case 'parent': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return <Shield className="w-4 h-4" />
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'intern': return <UserCheck className="w-4 h-4" />
      case 'student': return <GraduationCap className="w-4 h-4" />
      case 'parent': return <Users className="w-4 h-4" />
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      full_name: user.full_name,
      role: user.role,
      phone_number: user.phone_number || '',
      school_institution: user.school_institution || '',
      grade_level: user.grade_level?.toString() || '',
      bio: user.bio || ''
    })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={fetchUsers} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage user accounts and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{users.length}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(user => user.last_active && new Date(user.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-sm text-gray-500">Active This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {user.full_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {user.phone_number}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Joined: {formatDate(user.created_at)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`flex items-center space-x-1 ${getRoleColor(user.role, user.is_super_admin || false)}`}>
                        {getRoleIcon(user.role, user.is_super_admin || false)}
                        <span className="capitalize">
                          {user.is_super_admin ? 'Super Admin' : user.role.replace('_', ' ')}
                        </span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {user.school_institution && (
                        <div>
                          <div className="flex items-center mb-2">
                            <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium text-gray-700">School/Institution</span>
                          </div>
                          <p className="text-sm text-gray-600">{user.school_institution}</p>
                          {user.grade_level && (
                            <p className="text-sm text-gray-600">Grade {user.grade_level}</p>
                          )}
                        </div>
                      )}

                      {user.areas_of_interest && user.areas_of_interest.length > 0 && (
                        <div>
                          <div className="flex items-center mb-2">
                            <BookOpen className="w-4 h-4 mr-2 text-green-600" />
                            <span className="font-medium text-gray-700">Areas of Interest</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {user.areas_of_interest.slice(0, 3).map((area, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                            {user.areas_of_interest.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{user.areas_of_interest.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Last Active: {user.last_active ? formatDate(user.last_active) : 'Never'}</span>
                      {user.total_volunteer_hours && (
                        <span>Volunteer Hours: {user.total_volunteer_hours}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-2">
                    {canEditUser(user) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        disabled={actionLoading === user.id}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </>
                        )}
                      </Button>
                    ) : (
                      <div className="text-xs text-gray-500 text-center px-2 py-1 bg-gray-100 rounded">
                        Cannot Edit
                      </div>
                    )}

                    {canDeleteUser(user) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={actionLoading === user.id}
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${user.full_name}?`)) {
                            deleteUser(user.id)
                          }
                        }}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                <p className="text-gray-600">No users match your current search criteria.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <Input
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <Select 
                    value={editForm.role} 
                    onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                    disabled={!canChangeRole(selectedUser)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {!canChangeRole(selectedUser) && (
                    <p className="text-xs text-gray-500 mt-1">You cannot change this user's role</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <Input
                    value={editForm.phone_number}
                    onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">School/Institution</label>
                  <Input
                    value={editForm.school_institution}
                    onChange={(e) => setEditForm({ ...editForm, school_institution: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Grade Level</label>
                  <Input
                    type="number"
                    value={editForm.grade_level}
                    onChange={(e) => setEditForm({ ...editForm, grade_level: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Bio</label>
                  <Input
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateUser(selectedUser.id, editForm)}
                    disabled={actionLoading === selectedUser.id}
                  >
                    {actionLoading === selectedUser.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


