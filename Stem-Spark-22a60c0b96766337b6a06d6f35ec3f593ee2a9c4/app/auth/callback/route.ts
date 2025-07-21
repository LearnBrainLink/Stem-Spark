import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { RoleManager } from '@/lib/role-manager'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const roleManager = new RoleManager()
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
      }

      if (data.user) {
        console.log('✅ User authenticated:', data.user.email)

        // Use role manager to get user role and determine redirect
        const userRole = await roleManager.getUserRole(data.user)
        console.log('🎯 User role determined:', userRole)

        // Get dashboard URL based on role
        const redirectPath = roleManager.getDashboardUrl(userRole)
        console.log('📍 Redirecting to:', redirectPath)

        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=An unexpected error occurred`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=No code provided`)
}
