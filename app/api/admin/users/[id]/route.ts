import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import AdminProtection from '@/lib/admin-protection';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const adminProtection = new AdminProtection();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's profile
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single();

    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user can edit target user
    const canEdit = await adminProtection.canPerformAction({
      adminId: user.id,
      adminRole: currentProfile.role,
      isSuperAdmin: currentProfile.is_super_admin || false,
      action: 'edit_user',
      targetUserId: params.id,
      targetUserRole: targetUser.role,
      targetIsSuperAdmin: targetUser.is_super_admin || false
    });

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this user' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { full_name, email, role, status } = body;

    // Validate role change
    if (role && role !== targetUser.role) {
      const canChangeRole = await adminProtection.validateRoleChange({
        adminId: user.id,
        adminRole: currentProfile.role,
        isSuperAdmin: currentProfile.is_super_admin || false,
        newRole: role,
        targetUserId: params.id,
        targetUserRole: targetUser.role
      });

      if (!canChangeRole) {
        return NextResponse.json(
          { error: 'Cannot change user role' },
          { status: 403 }
        );
      }
    }

    // Update user
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name,
        email,
        role,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminProtection.logAdminAction({
      adminId: user.id,
      adminRole: currentProfile.role,
      action: 'edit_user',
      targetId: params.id,
      details: `Updated user ${full_name} (${email})`,
      metadata: { changes: body }
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const adminProtection = new AdminProtection();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user's profile
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role, is_super_admin')
      .eq('id', user.id)
      .single();

    if (!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get target user
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, is_super_admin, full_name, email')
      .eq('id', params.id)
      .single();

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user can delete target user
    const canDelete = await adminProtection.canPerformAction({
      adminId: user.id,
      adminRole: currentProfile.role,
      isSuperAdmin: currentProfile.is_super_admin || false,
      action: 'delete_user',
      targetUserId: params.id,
      targetUserRole: targetUser.role,
      targetIsSuperAdmin: targetUser.is_super_admin || false
    });

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this user' },
        { status: 403 }
      );
    }

    // Delete user (soft delete by setting status to deleted)
    const { error: deleteError } = await supabase
      .from('profiles')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // Log admin action
    await adminProtection.logAdminAction({
      adminId: user.id,
      adminRole: currentProfile.role,
      action: 'delete_user',
      targetId: params.id,
      details: `Deleted user ${targetUser.full_name} (${targetUser.email})`,
      metadata: { deletedAt: new Date().toISOString() }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 