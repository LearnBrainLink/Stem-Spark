import { createServerClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
      }

      if (data.user) {
        // Update email_verified status in profiles table
        await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', data.user.id)

        // Get user role to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        let redirectPath = '/dashboard'
        if (profile && (profile as any).role) {
          const role = (profile as any).role
          if (role === 'admin') {
            redirectPath = '/admin'
          } else if (role === 'teacher') {
            redirectPath = '/teacher-dashboard'
          } else if (role === 'student') {
            redirectPath = '/student-dashboard'
          }
        }

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
