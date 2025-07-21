import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export interface AdminAction {
  action_type: 'edit_user' | 'delete_user' | 'change_role' | 'approve_hours' | 'approve_application' | 'reject_application'
  target_user_id: string
  performed_by: string
  is_allowed: boolean
  reason?: string
  timestamp: string
}

export interface RolePermissions {
  role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent'
  permissions: {
    can_edit_admins: boolean
    can_delete_admins: boolean
    can_change_admin_roles: boolean
    can_approve_volunteer_hours: boolean
    can_manage_content: boolean
    can_view_analytics: boolean
    can_manage_applications: boolean
    can_create_restricted_channels: boolean
    can_send_announcements: boolean
  }
}

class AdminProtectionService {
  private supabase

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  // Role permission definitions
  private readonly rolePermissions: Record<string, RolePermissions> = {
    super_admin: {
      role: 'super_admin',
      permissions: {
        can_edit_admins: true,
        can_delete_admins: true,
        can_change_admin_roles: true,
        can_approve_volunteer_hours: true,
        can_manage_content: true,
        can_view_analytics: true,
        can_manage_applications: true,
        can_create_restricted_channels: true,
        can_send_announcements: true
      }
    },
    admin: {
      role: 'admin',
      permissions: {
        can_edit_admins: false,
        can_delete_admins: false,
        can_change_admin_roles: false,
        can_approve_volunteer_hours: true,
        can_manage_content: true,
        can_view_analytics: true,
        can_manage_applications: true,
        can_create_restricted_channels: true,
        can_send_announcements: true
      }
    },
    intern: {
      role: 'intern',
      permissions: {
        can_edit_admins: false,
        can_delete_admins: false,
        can_change_admin_roles: false,
        can_approve_volunteer_hours: false,
        can_manage_content: false,
        can_view_analytics: false,
        can_manage_applications: false,
        can_create_restricted_channels: false,
        can_send_announcements: false
      }
    },
    student: {
      role: 'student',
      permissions: {
        can_edit_admins: false,
        can_delete_admins: false,
        can_change_admin_roles: false,
        can_approve_volunteer_hours: false,
        can_manage_content: false,
        can_view_analytics: false,
        can_manage_applications: false,
        can_create_restricted_channels: false,
        can_send_announcements: false
      }
    },
    parent: {
      role: 'parent',
      permissions: {
        can_edit_admins: false,
        can_delete_admins: false,
        can_change_admin_roles: false,
        can_approve_volunteer_hours: false,
        can_manage_content: false,
        can_view_analytics: false,
        can_manage_applications: false,
        can_create_restricted_channels: false,
        can_send_announcements: false
      }
    }
  }

  // Get user permissions
  async getUserPermissions(userId: string): Promise<{ success: boolean; permissions?: RolePermissions; error?: string }> {
    try {
      const { data: user, error } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Determine effective role
      let effectiveRole = user.role
      if (user.is_super_admin) {
        effectiveRole = 'super_admin'
      }

      const permissions = this.rolePermissions[effectiveRole]
      if (!permissions) {
        return { success: false, error: 'Invalid role' }
      }

      return { success: true, permissions }
    } catch (error) {
      console.error('Error getting user permissions:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Check if user can perform admin action
  async canPerformAdminAction(
    performerId: string,
    actionType: AdminAction['action_type'],
    targetUserId?: string
  ): Promise<{ success: boolean; allowed: boolean; reason?: string; error?: string }> {
    try {
      // Get performer's permissions
      const { success: permSuccess, permissions: performerPerms, error: permError } = 
        await this.getUserPermissions(performerId)

      if (!permSuccess || !performerPerms) {
        return { success: false, allowed: false, error: permError }
      }

      // Get target user if provided
      let targetUser: Profile | null = null
      if (targetUserId) {
        const { data: user, error: userError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .single()

        if (userError) throw userError
        targetUser = user
      }

      // Check specific action permissions
      let allowed = false
      let reason = ''

      switch (actionType) {
        case 'edit_user':
          if (!targetUser) {
            return { success: false, allowed: false, error: 'Target user not found' }
          }
          
          // Super admins can edit anyone
          if (performerPerms.role === 'super_admin') {
            allowed = true
            reason = 'Super admin can edit any user'
          }
          // Regular admins cannot edit other admins or super admins
          else if (performerPerms.role === 'admin') {
            if (targetUser.role === 'admin' || targetUser.is_super_admin) {
              allowed = false
              reason = 'Admins cannot edit other admins or super admins'
            } else {
              allowed = true
              reason = 'Admin can edit non-admin users'
            }
          }
          // Non-admins cannot edit anyone
          else {
            allowed = false
            reason = 'Only admins can edit users'
          }
          break

        case 'delete_user':
          if (!targetUser) {
            return { success: false, allowed: false, error: 'Target user not found' }
          }
          
          // Only super admins can delete users
          if (performerPerms.role === 'super_admin') {
            allowed = true
            reason = 'Super admin can delete any user'
          } else {
            allowed = false
            reason = 'Only super admins can delete users'
          }
          break

        case 'change_role':
          if (!targetUser) {
            return { success: false, allowed: false, error: 'Target user not found' }
          }
          
          // Only super admins can change roles
          if (performerPerms.role === 'super_admin') {
            allowed = true
            reason = 'Super admin can change any user role'
          } else {
            allowed = false
            reason = 'Only super admins can change user roles'
          }
          break

        case 'approve_hours':
          allowed = performerPerms.permissions.can_approve_volunteer_hours
          reason = allowed ? 'User has permission to approve volunteer hours' : 'User lacks permission to approve volunteer hours'
          break

        case 'approve_application':
        case 'reject_application':
          allowed = performerPerms.permissions.can_manage_applications
          reason = allowed ? 'User has permission to manage applications' : 'User lacks permission to manage applications'
          break

        default:
          allowed = false
          reason = 'Unknown action type'
      }

      // Log the action
      await this.logAdminAction(actionType, targetUserId || '', performerId, allowed, reason)

      return { success: true, allowed, reason }
    } catch (error) {
      console.error('Error checking admin action permission:', error)
      return { success: false, allowed: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Validate admin signup restrictions
  async validateSignupRole(role: string): Promise<{ success: boolean; allowed: boolean; error?: string }> {
    try {
      // Prevent admin role selection during signup
      if (role === 'admin' || role === 'super_admin') {
        return { success: true, allowed: false, error: 'Admin roles cannot be selected during signup' }
      }

      // Validate role exists
      if (!this.rolePermissions[role]) {
        return { success: true, allowed: false, error: 'Invalid role selected' }
      }

      return { success: true, allowed: true }
    } catch (error) {
      console.error('Error validating signup role:', error)
      return { success: false, allowed: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Promote user to admin (super admin only)
  async promoteToAdmin(
    userId: string,
    promotedBy: string,
    isSuperAdmin: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if promoter can promote users
      const { success: canPromote, allowed } = await this.canPerformAdminAction(
        promotedBy,
        'change_role',
        userId
      )

      if (!canPromote || !allowed) {
        return { success: false, error: 'You do not have permission to promote users to admin' }
      }

      // Update user role
      const updateData: any = {
        role: 'admin',
        updated_at: new Date().toISOString()
      }

      if (isSuperAdmin) {
        updateData.is_super_admin = true
      }

      const { error } = await this.supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction('change_role', userId, promotedBy, true, `Promoted to ${isSuperAdmin ? 'super admin' : 'admin'}`)

      return { success: true }
    } catch (error) {
      console.error('Error promoting user to admin:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Demote admin (super admin only)
  async demoteAdmin(
    userId: string,
    demotedBy: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if demoter can demote users
      const { success: canDemote, allowed } = await this.canPerformAdminAction(
        demotedBy,
        'change_role',
        userId
      )

      if (!canDemote || !allowed) {
        return { success: false, error: 'You do not have permission to demote admins' }
      }

      // Get target user
      const { data: targetUser, error: userError } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      if (!targetUser) {
        return { success: false, error: 'User not found' }
      }

      if (targetUser.role !== 'admin' && !targetUser.is_super_admin) {
        return { success: false, error: 'User is not an admin' }
      }

      // Demote to intern role
      const { error } = await this.supabase
        .from('profiles')
        .update({
          role: 'intern',
          is_super_admin: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      // Log the action
      await this.logAdminAction('change_role', userId, demotedBy, true, 'Demoted from admin to intern')

      return { success: true }
    } catch (error) {
      console.error('Error demoting admin:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Get admin action logs
  async getAdminActionLogs(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; logs?: AdminAction[]; error?: string }> {
    try {
      const { data: logs, error } = await this.supabase
        .from('admin_actions_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { success: true, logs: logs || [] }
    } catch (error) {
      console.error('Error getting admin action logs:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Log admin action
  private async logAdminAction(
    actionType: string,
    targetUserId: string,
    performedBy: string,
    isAllowed: boolean,
    reason?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('admin_actions_log')
        .insert({
          action_type: actionType,
          target_user_id: targetUserId,
          performed_by: performedBy,
          is_allowed: isAllowed,
          reason: reason
        })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  // Get admin statistics
  async getAdminStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const { data: users, error: usersError } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')

      if (usersError) throw usersError

      const { data: logs, error: logsError } = await this.supabase
        .from('admin_actions_log')
        .select('*')

      if (logsError) throw logsError

      const stats = {
        total_users: users?.length || 0,
        admin_users: users?.filter(u => u.role === 'admin' || u.is_super_admin).length || 0,
        super_admin_users: users?.filter(u => u.is_super_admin).length || 0,
        total_admin_actions: logs?.length || 0,
        allowed_actions: logs?.filter(l => l.is_allowed).length || 0,
        denied_actions: logs?.filter(l => !l.is_allowed).length || 0
      }

      return { success: true, stats }
    } catch (error) {
      console.error('Error getting admin stats:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export singleton instance
export const adminProtectionService = new AdminProtectionService() 