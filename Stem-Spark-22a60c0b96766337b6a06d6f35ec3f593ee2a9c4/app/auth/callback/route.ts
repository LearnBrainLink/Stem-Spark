import { createServerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { roleManager } from '@/lib/role-manager'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerClient()
    
    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
      }

      if (data.user) {
        // Get user role and redirect to appropriate dashboard
        const userRole = await roleManager.getUserRole(data.user)
        const dashboardUrl = roleManager.getDashboardUrl(userRole)
        
        console.log(`User ${data.user.email} logged in with role ${userRole}, redirecting to ${dashboardUrl}`)
        
        return NextResponse.redirect(`${origin}${dashboardUrl}`)
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=Unexpected error occurred`)
    }
  }

  // Return to login if no code
  return NextResponse.redirect(`${origin}/login`)
}
