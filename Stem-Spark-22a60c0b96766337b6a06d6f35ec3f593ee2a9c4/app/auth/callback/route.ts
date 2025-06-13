import { createServerClient } from "@/lib/supabase-simple"
import { roleManager } from "@/lib/role-manager"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  console.log("🔄 Auth callback received:", { code: !!code, error, errorDescription })

  // Handle OAuth errors
  if (error) {
    console.error("❌ OAuth error:", error, errorDescription)
    const errorUrl = new URL("/auth/auth-code-error", request.url)
    errorUrl.searchParams.set("error", error)
    if (errorDescription) {
      errorUrl.searchParams.set("error_description", errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  // If there's no code, redirect to login
  if (!code) {
    console.warn("⚠️ No auth code provided")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const supabase = createServerClient()

    // Exchange the code for a session
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error("❌ Auth code exchange error:", exchangeError.message)
      const errorUrl = new URL("/auth/auth-code-error", request.url)
      errorUrl.searchParams.set("error", "exchange_failed")
      errorUrl.searchParams.set("error_description", exchangeError.message)
      return NextResponse.redirect(errorUrl)
    }

    if (!data.user || !data.session) {
      console.error("❌ No user or session after code exchange")
      return NextResponse.redirect(new URL("/auth/auth-code-error", request.url))
    }

    console.log(`✅ User authenticated via callback: ${data.user.id}`)

    // Set session cookie for client-side auth
    try {
      cookies().set("supabase-auth-token", JSON.stringify(data.session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    } catch (cookieError) {
      console.error("⚠️ Cookie setting failed:", cookieError)
    }

    // Determine if this is a new user (social signup) or existing user
    const isNewUser = !data.user.email_confirmed_at || new Date(data.user.created_at).getTime() > Date.now() - 60000 // Created within last minute

    // Get or create user profile
    let userProfile = await roleManager.getUserProfile(data.user.id)

    if (!userProfile) {
      console.log("📝 Creating profile for new social login user")

      // Determine role from email or default to student
      const role = data.user.email?.includes("admin")
        ? "admin"
        : data.user.email?.includes("teacher")
          ? "teacher"
          : "student"

      const profileSuccess = await roleManager.upsertUserProfile(data.user, role, {
        full_name:
          data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split("@")[0] || "",
        email_verified: true, // Social logins are pre-verified
      })

      if (profileSuccess) {
        userProfile = await roleManager.getUserProfile(data.user.id)
      }
    }

    // Get user role
    const userRole = await roleManager.getUserRole(data.user)
    console.log(`👤 User role determined: ${userRole}`)

    // Log login activity
    try {
      const provider = data.user.app_metadata?.provider || "unknown"
      await supabase.from("user_activities").insert({
        user_id: data.user.id,
        activity_type: isNewUser ? "social_signup" : "social_login",
        activity_description: `${isNewUser ? "Account created" : "Logged in"} via ${provider}`,
        metadata: {
          timestamp: new Date().toISOString(),
          role: userRole,
          provider: provider,
          is_new_user: isNewUser,
        },
      })
    } catch (activityError) {
      console.error("⚠️ Activity logging failed:", activityError)
    }

    // Update last login
    try {
      await supabase
        .from("profiles")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          email_verified: true,
        })
        .eq("id", data.user.id)
    } catch (updateError) {
      console.error("⚠️ Profile update failed:", updateError)
    }

    console.log(`🎉 Auth callback successful for ${data.user.email}`)

    // Redirect based on role
    const redirectUrl = roleManager.getDashboardUrl(userRole)
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  } catch (error) {
    console.error("💥 Auth callback unexpected error:", error)
    const errorUrl = new URL("/auth/auth-code-error", request.url)
    errorUrl.searchParams.set("error", "unexpected_error")
    errorUrl.searchParams.set("error_description", "An unexpected error occurred during authentication")
    return NextResponse.redirect(errorUrl)
  }
}
