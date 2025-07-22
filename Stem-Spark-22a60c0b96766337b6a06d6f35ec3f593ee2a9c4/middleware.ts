import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create Supabase client for middleware
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get session from cookies
  const authCookie = req.cookies.get('sb-access-token')?.value
  const refreshCookie = req.cookies.get('sb-refresh-token')?.value

  let session = null
  if (authCookie && refreshCookie) {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session = currentSession
    } catch (error) {
      console.error('Error getting session in middleware:', error)
    }
  }

  // Define protected routes
  const protectedRoutes = [
    '/student-dashboard',
    '/parent-dashboard', 
    '/admin',
    '/profile',
    '/communication-hub',
    '/tutoring',
    '/intern-dashboard'
  ]

  // Define admin-only routes
  const adminRoutes = ['/admin']

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  const isAdminRoute = adminRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing admin route, check if user is admin
  if (isAdminRoute && session) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/student-dashboard', req.url))
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // If user is logged in and trying to access login/signup, redirect to dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/sign%20up')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role) {
        const dashboardUrl = profile.role === 'admin' ? '/admin' : 
                           profile.role === 'parent' ? '/parent-dashboard' : 
                           '/student-dashboard'
        return NextResponse.redirect(new URL(dashboardUrl, req.url))
      }
    } catch (error) {
      console.error('Error checking user role for redirect:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (to avoid conflicts)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 