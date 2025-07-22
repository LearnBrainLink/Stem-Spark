import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function validateAdminAccess(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { error: 'Unauthorized', status: 401 }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { error: 'Profile not found', status: 404 }
    }

    if (profile.role !== 'admin' && !profile.is_super_admin) {
      return { error: 'Admin access required', status: 403 }
    }

    return { user, profile, error: null }
  } catch (error) {
    return { error: 'Internal server error', status: 500 }
  }
}

export async function validateSuperAdminAccess(request: NextRequest) {
  const result = await validateAdminAccess(request)
  
  if (result.error) {
    return result
  }

  if (!result.profile?.is_super_admin) {
    return { error: 'Super admin access required', status: 403 }
  }

  return result
}

export function withAdminProtection(handler: Function) {
  return async (request: NextRequest) => {
    const validation = await validateAdminAccess(request)
    
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    return handler(request, validation.user, validation.profile)
  }
}

export function withSuperAdminProtection(handler: Function) {
  return async (request: NextRequest) => {
    const validation = await validateSuperAdminAccess(request)
    
    if (validation.error) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      )
    }

    return handler(request, validation.user, validation.profile)
  }
}

class AdminProtectionService {
  private supabase = createClient()

  async getAdminActionLogs(limit: number = 100) {
    try {
      const { data, error } = await this.supabase
        .from('admin_actions_log')
        .select(`
          *,
          performed_by:profiles!admin_actions_log_performed_by_fkey(full_name, email),
          target_user:profiles!admin_actions_log_target_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching admin action logs:', error)
      throw error
    }
  }

  async logAdminAction(
    actionType: string,
    performedBy: string,
    targetUserId?: string,
    metadata?: any,
    isAllowed: boolean = true,
    reason?: string
  ) {
    try {
      const { error } = await this.supabase
        .from('admin_actions_log')
        .insert({
          action_type: actionType,
          performed_by: performedBy,
          target_user_id: targetUserId,
          metadata,
          is_allowed: isAllowed,
          reason
        })

      if (error) throw error
    } catch (error) {
      console.error('Error logging admin action:', error)
      throw error
    }
  }

  async validateAdminAccess(userId: string) {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', userId)
        .single()

      if (error || !profile) {
        return { isValid: false, reason: 'Profile not found' }
      }

      if (profile.role !== 'admin' && !profile.is_super_admin) {
        return { isValid: false, reason: 'Admin access required' }
      }

      return { isValid: true, profile }
    } catch (error) {
      console.error('Error validating admin access:', error)
      return { isValid: false, reason: 'Error validating access' }
    }
  }

  async canEditUser(currentUserId: string, targetUserId: string) {
    try {
      // Get current user's role
      const { data: currentUser, error: currentError } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', currentUserId)
        .single()

      if (currentError || !currentUser) {
        return { canEdit: false, reason: 'Current user not found' }
      }

      // If current user is not admin, they cannot edit anyone
      if (currentUser.role !== 'admin' && !currentUser.is_super_admin) {
        return { canEdit: false, reason: 'Insufficient permissions' }
      }

      // If editing self, always allow
      if (currentUserId === targetUserId) {
        return { canEdit: true }
      }

      // Get target user's role
      const { data: targetUser, error: targetError } = await this.supabase
        .from('profiles')
        .select('role, is_super_admin')
        .eq('id', targetUserId)
        .single()

      if (targetError || !targetUser) {
        return { canEdit: false, reason: 'Target user not found' }
      }

      // Super admins can edit anyone
      if (currentUser.is_super_admin) {
        return { canEdit: true }
      }

      // Regular admins cannot edit other admins or super admins
      if (targetUser.role === 'admin' || targetUser.is_super_admin) {
        return { canEdit: false, reason: 'Cannot edit other administrators' }
      }

      // Regular admins can edit non-admin users
      return { canEdit: true }
    } catch (error) {
      console.error('Error checking admin edit permissions:', error)
      return { canEdit: false, reason: 'Error checking permissions' }
    }
  }
}

// Export the class as default
export default AdminProtectionService 