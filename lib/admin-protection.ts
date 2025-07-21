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