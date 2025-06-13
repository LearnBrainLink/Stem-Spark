import { createServerClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json({ error: "Test email is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Test password reset email (this doesn't actually send to a real user)
    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      console.error("Email test error:", error)
      return NextResponse.json(
        {
          error: error.message,
          success: false,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Email configuration test successful",
    })
  } catch (error) {
    console.error("Email test API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 },
    )
  }
}
