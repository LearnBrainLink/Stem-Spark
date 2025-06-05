import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  console.log("🔄 Auth callback received", { code: !!code, next })

  if (code) {
    const supabase = createServerClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        console.log("✅ Code exchange successful")

        // Get the user to update their profile and determine redirect
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          console.log(`👤 User verified: ${user.email}`)

          // Mark email as verified
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("⚠️ Failed to update email verification:", updateError)
          } else {
            console.log("✅ Email verification status updated")
          }

          // Get user role for redirect
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

          // Log verification activity
          await supabase.from("user_activities").insert({
            user_id: user.id,
            activity_type: "email_verified",
            activity_description: "Email address verified successfully",
            metadata: {
              email: user.email,
              verified_at: new Date().toISOString(),
            },
          })

          console.log(`🎉 Email verified for user: ${user.email}`)

          // Redirect based on role
          let redirectPath = "/student-dashboard" // default
          if (profile?.role === "admin") {
            redirectPath = "/admin"
            console.log("🔄 Redirecting to admin dashboard")
          } else if (profile?.role === "teacher") {
            redirectPath = "/teacher-dashboard"
            console.log("🔄 Redirecting to teacher dashboard")
          } else {
            console.log("🔄 Redirecting to student dashboard")
          }

          return NextResponse.redirect(`${origin}${redirectPath}`)
        }

        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error("❌ Code exchange failed:", error)
      }
    } catch (error) {
      console.error("💥 Auth callback error:", error)
    }
  }

  // Return the user to an error page with instructions
  console.log("❌ Auth callback failed, redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
