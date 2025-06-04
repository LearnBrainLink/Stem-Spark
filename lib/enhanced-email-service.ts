"use server"

import { createServerClient } from "./supabase"

interface WelcomeEmailProps {
  to: string
  fullName: string
  role: string
}

interface VerificationEmailProps {
  to: string
  fullName: string
}

interface InternshipNotificationProps {
  to: string
  fullName: string
  internshipTitle: string
  status: string
}

export async function sendWelcomeEmail({ to, fullName, role }: WelcomeEmailProps) {
  const supabase = createServerClient()

  const { data: template } = await supabase.from("email_templates").select("*").eq("name", "welcome").single()

  if (!template) {
    console.error("Welcome email template not found")
    return { error: "Email template not found" }
  }

  let htmlContent = template.html_content
  let subject = template.subject

  // Replace variables
  htmlContent = htmlContent.replace(/{{fullName}}/g, fullName)
  htmlContent = htmlContent.replace(/{{role}}/g, role)
  htmlContent = htmlContent.replace(/{{siteUrl}}/g, process.env.NEXT_PUBLIC_SITE_URL || "")

  subject = subject.replace(/{{fullName}}/g, fullName)

  console.log(`Sending welcome email to: ${to}`)
  console.log(`Subject: ${subject}`)

  // In production, integrate with your email service (Resend, SendGrid, etc.)
  // For now, we'll log the email content

  return { success: true }
}

export async function sendVerificationEmail({ to, fullName }: VerificationEmailProps) {
  console.log(`Sending verification email to: ${to} for ${fullName}`)

  // In production, this would send an actual verification email
  // For demo purposes, we'll just log it

  return { success: true }
}

export async function sendInternshipNotification({
  to,
  fullName,
  internshipTitle,
  status,
}: InternshipNotificationProps) {
  console.log(`Sending internship ${status} notification to: ${to} for ${internshipTitle}`)

  // In production, this would send an actual notification email

  return { success: true }
}

// Legacy function for backward compatibility
export async function sendEmail({ to, templateName, variables }: any) {
  if (templateName === "welcome") {
    return sendWelcomeEmail({
      to,
      fullName: variables.fullName,
      role: variables.role,
    })
  }

  return { success: true }
}
