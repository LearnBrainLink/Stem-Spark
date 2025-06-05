import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createServerClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user to update their profile and determine redirect
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Mark email as verified
        await supabase
          .from("profiles")
          .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

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

        console.log(`✅ Email verified for user: ${user.email}`)

        // Redirect based on role
        let redirectPath = "/student-dashboard" // default
        if (profile?.role === "admin") {
          redirectPath = "/admin"
        } else if (profile?.role === "teacher") {
          redirectPath = "/teacher-dashboard"
        }

        return NextResponse.redirect(`${origin}${redirectPath}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
