"use server"

import { createServerClient } from "./supabase"

interface EmailProps {
  to: string
  templateName: string
  variables: Record<string, any>
}

export async function sendEmail({ to, templateName, variables }: EmailProps) {
  const supabase = createServerClient()

  const { data: template, error } = await supabase.from("email_templates").select("*").eq("name", templateName).single()

  if (error) {
    console.error("Error fetching email template:", error)
    return { error: "Failed to send email." }
  }

  let htmlContent = template.html_content
  let subject = template.subject

  // Replace variables in content and subject
  for (const key in variables) {
    const regex = new RegExp(`{{${key}}}`, "g")
    htmlContent = htmlContent.replace(regex, variables[key])
    subject = subject.replace(regex, variables[key])
  }

  // Add site URL
  htmlContent = htmlContent.replace(/{{siteUrl}}/g, process.env.NEXT_PUBLIC_SITE_URL || "")

  console.log("Sending email to:", to)
  console.log("Subject:", subject)
  // In production, integrate with your email service here

  return { success: true }
}

export async function sendVerificationEmail({ to, fullName }: { to: string; fullName: string }) {
  const verificationLink = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/verify?email=${encodeURIComponent(to)}&token=demo-token`

  console.log(`Sending verification email to: ${to} for ${fullName}`)
  console.log(`Verification link: ${verificationLink}`)

  return sendEmail({
    to,
    templateName: "verification",
    variables: {
      fullName,
      verificationLink,
    },
  })
}

export async function sendWelcomeEmail({ to, fullName, role }: { to: string; fullName: string; role: string }) {
  return sendEmail({
    to,
    templateName: "welcome",
    variables: { fullName, role },
  })
}

export async function sendPasswordResetEmail({ to }: { to: string }) {
  return sendEmail({
    to,
    templateName: "password_reset",
    variables: {
      resetLink: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/reset-password`,
    },
  })
}

export async function sendInternshipNotification({
  to,
  fullName,
  internshipTitle,
  status,
}: {
  to: string
  fullName: string
  internshipTitle: string
  status: string
}) {
  return sendEmail({
    to,
    templateName: "internship_notification",
    variables: { fullName, internshipTitle, status },
  })
}
