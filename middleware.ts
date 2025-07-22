import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/sign up' || 
                      path === '/signup' ||
                      path.startsWith('/api/') ||
                      path.includes('_next') ||
                      path.includes('favicon') ||
                      path.includes('static')

  // Check if user is authenticated
  const isAuthenticated = request.cookies.has('supabase-auth-token') || 
                         request.cookies.has('sb-access-token')

  // Redirect authenticated users away from public paths
  if (isAuthenticated && (path === '/login' || path === '/sign up' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Allow all requests to public paths
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For admin routes, check if user is admin
  if (path.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // For now, let the individual pages handle admin role checking
    // This prevents the middleware from making too many database calls
    return NextResponse.next()
  }

  // For protected routes, allow the request to continue
  // The individual pages/components can handle their own authentication logic
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 