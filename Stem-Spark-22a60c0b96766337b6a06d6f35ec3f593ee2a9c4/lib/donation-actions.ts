"use server"

import { createServerClient } from "./supabase"
import { sendEmail } from "./email-service"

export async function processDonation(formData: FormData) {
  const supabase = createServerClient()

  const amount = Number.parseFloat(formData.get("amount") as string)
  const donorName = formData.get("donorName") as string
  const donorEmail = formData.get("donorEmail") as string
  const message = formData.get("message") as string
  const isAnonymous = formData.get("isAnonymous") === "on"

  try {
    // In a real app, you'd integrate with Stripe or another payment processor
    // For demo purposes, we'll simulate a successful payment
    const paymentIntentId = `pi_${Math.random().toString(36).substr(2, 9)}`

    // Save donation to database
    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        amount,
        donor_name: donorName,
        donor_email: donorEmail,
        message,
        is_anonymous: isAnonymous,
        status: "completed",
        stripe_payment_intent_id: paymentIntentId,
      })
      .select()
      .single()

    if (error) {
      console.error("Donation save error:", error)
      return { error: "Failed to process donation. Please try again." }
    }

    // Send confirmation email
    await sendEmail({
      to: donorEmail,
      templateName: "donation_confirmation",
      variables: {
        donorName,
        amount: amount.toFixed(2),
        message,
        transactionId: paymentIntentId,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Donation processing error:", error)
    return { error: "Failed to process donation. Please try again." }
  }
}
