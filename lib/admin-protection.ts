import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

type Tables = Database['public']['Tables'];
type AdminActionLog = Tables['admin_actions_log']['Row'];
type Profile = Tables['profiles']['Row'];

export interface AdminAction {
  action_type: 'edit_user' | 'delete_user' | 'change_role' | 'approve_hours' | 'reject_hours' | 'create_channel' | 'delete_channel';
  target_user_id?: string;
  performed_by: string;
  is_allowed: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface RolePermissions {
  role: 'admin' | 'super_admin' | 'intern' | 'student' | 'parent';
  permissions: {
    can_edit_admins: boolean;
    can_delete_admins: boolean;
    can_change_admin_roles: boolean;
    can_approve_volunteer_hours: boolean;
    can_manage_content: boolean;
    can_view_analytics: boolean;
    can_manage_channels: boolean;
  };
}

class AdminProtection {
  private supabase;

  constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Check if a user can perform an admin action
   */
  async canPerformAction(action: AdminAction): Promise<{ allowed: boolean; reason?: string }> {
    try {
      // Get the performing user's profile
      const { data: performer, error: performerError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', action.performed_by)
        .single();

      if (performerError || !performer) {
        return { allowed: false, reason: 'Performer not found' };
      }

      // Check if performer is an admin
      if (performer.role !== 'admin' && !performer.is_super_admin) {
        return { allowed: false, reason: 'Only admins can perform this action' };
      }

      // If there's a target user, check if they're an admin
      if (action.target_user_id) {
        const { data: targetUser, error: targetError } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', action.target_user_id)
          .single();

        if (targetError || !targetUser) {
          return { allowed: false, reason: 'Target user not found' };
        }

        // Prevent admins from editing other admins (unless super admin)
        if (targetUser.role === 'admin' && !performer.is_super_admin) {
          return { allowed: false, reason: 'Regular admins cannot modify other admins' };
        }

        // Prevent admins from editing super admins
        if (targetUser.is_super_admin && !performer.is_super_admin) {
          return { allowed: false, reason: 'Cannot modify super admin accounts' };
        }
      }

      // Log the action
      await this.logAdminAction(action);

      return { allowed: true };
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      return { allowed: false, reason: 'Internal error' };
    }
  }

  /**
   * Log an admin action for audit purposes
   */
  async logAdminAction(action: AdminAction): Promise<void> {
    try {
      await this.supabase
        .from('admin_actions_log')
        .insert({
          action_type: action.action_type,
          target_user_id: action.target_user_id,
          performed_by: action.performed_by,
          is_allowed: action.is_allowed,
          reason: action.reason,
          metadata: action.metadata
        });
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  }

  /**
   * Get admin action logs
   */
  async getAdminActionLogs(limit: number = 100): Promise<AdminActionLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('admin_actions_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin action logs:', error);
      return [];
    }
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role: string): RolePermissions {
    const permissions: Record<string, RolePermissions> = {
      super_admin: {
        role: 'super_admin',
        permissions: {
          can_edit_admins: true,
          can_delete_admins: true,
          can_change_admin_roles: true,
          can_approve_volunteer_hours: true,
          can_manage_content: true,
          can_view_analytics: true,
          can_manage_channels: true,
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
          can_manage_channels: true,
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
          can_manage_channels: false,
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
          can_manage_channels: false,
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
          can_manage_channels: false,
        }
      }
    };

    return permissions[role] || permissions.student;
  }

  /**
   * Validate user role change
   */
  async validateRoleChange(
    performerId: string,
    targetUserId: string,
    newRole: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const action: AdminAction = {
      action_type: 'change_role',
      target_user_id: targetUserId,
      performed_by: performerId,
      is_allowed: false,
      reason: ''
    };

    const result = await this.canPerformAction(action);
    
    if (!result.allowed) {
      return result;
    }

    // Additional role-specific validations
    if (newRole === 'admin' || newRole === 'super_admin') {
      const { data: performer } = await this.supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', performerId)
        .single();

      if (!performer?.is_super_admin) {
        return { allowed: false, reason: 'Only super admins can assign admin roles' };
      }
    }

    return { allowed: true };
  }

  /**
   * Check if user is super admin
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('is_super_admin')
        .eq('id', userId)
        .single();

      if (error) return false;
      return data?.is_super_admin || false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get admin statistics
   */
  async getAdminStats(): Promise<{
    total_admins: number;
    total_super_admins: number;
    recent_actions: number;
    blocked_actions: number;
  }> {
    try {
      const [
        { count: totalAdmins },
        { count: totalSuperAdmins },
        { count: recentActions },
        { count: blockedActions }
      ] = await Promise.all([
        this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        this.supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_super_admin', true),
        this.supabase.from('admin_actions_log').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        this.supabase.from('admin_actions_log').select('*', { count: 'exact', head: true }).eq('is_allowed', false)
      ]);

      return {
        total_admins: totalAdmins || 0,
        total_super_admins: totalSuperAdmins || 0,
        recent_actions: recentActions || 0,
        blocked_actions: blockedActions || 0
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        total_admins: 0,
        total_super_admins: 0,
        recent_actions: 0,
        blocked_actions: 0
      };
    }
  }
}

export default AdminProtection; 