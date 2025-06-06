import { createServerClient } from "@/lib/supabase-simple"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // If there's no code, redirect to home
  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    const supabase = createServerClient()

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error.message)
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
    }

    // Set cookies for client-side auth
    if (data.session) {
      cookies().set("supabase-auth-token", JSON.stringify(data.session))
    }

    // Get user role from metadata
    const role = data.user?.user_metadata?.role || "student"

    // Redirect based on role
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else if (role === "teacher") {
      return NextResponse.redirect(new URL("/teacher-dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/student-dashboard", request.url))
    }
  } catch (error) {
    console.error("Auth callback unexpected error:", error)
    return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
  }
}
