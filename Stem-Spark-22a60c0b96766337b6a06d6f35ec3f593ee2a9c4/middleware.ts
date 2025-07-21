import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/' || 
                      path === '/login' || 
                      path === '/sign up' || 
                      path === '/signup' ||
                      path.startsWith('/api/') ||
                      path.includes('_next') ||
                      path.includes('favicon')

  // Check if user is authenticated (you can implement your own logic here)
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