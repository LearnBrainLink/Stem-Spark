"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { processDonation } from "@/lib/donation-actions"
import { Heart, Users, BookOpen, Lightbulb, CreditCard } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"

export default function DonatePage() {
  const [amount, setAmount] = useState("25")
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const predefinedAmounts = ["10", "25", "50", "100", "250"]

  const handleDonation = async (formData: FormData) => {
    setIsLoading(true)
    setMessage(null)

    const finalAmount = amount === "custom" ? customAmount : amount
    formData.set("amount", finalAmount)

    const result = await processDonation(formData)

    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    } else if (result?.success) {
      setMessage({
        type: "success",
        text: "Thank you for your generous donation! You should receive a confirmation email shortly.",
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo width={40} height={40} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              STEM Spark Academy
            </span>
          </Link>
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
              Support Young Engineers
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your donation helps us provide free, high-quality STEM education to students everywhere, regardless of
              their background or circumstances.
            </p>
          </div>

          {/* Impact Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">$25 Impact</h3>
                <p className="text-gray-600">Provides STEM resources for 5 students for one month</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 text-center">
                <BookOpen className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">$50 Impact</h3>
                <p className="text-gray-600">Funds development of new hands-on learning activities</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-6 text-center">
                <Lightbulb className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">$100 Impact</h3>
                <p className="text-gray-600">Sponsors a complete engineering course for underserved schools</p>
              </CardContent>
            </Card>
          </div>

          {/* Donation Form */}
          <Card className="shadow-xl border-0 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                <CreditCard className="w-6 h-6" />
                Make a Donation
              </CardTitle>
              <CardDescription className="text-center">
                Every contribution makes a difference in a young engineer's life
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <Alert
                  className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
                >
                  <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              <form action={handleDonation} className="space-y-6">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Donation Amount</Label>
                  <RadioGroup value={amount} onValueChange={setAmount} className="grid grid-cols-3 gap-4">
                    {predefinedAmounts.map((amt) => (
                      <div key={amt} className="flex items-center space-x-2">
                        <RadioGroupItem value={amt} id={`amount-${amt}`} />
                        <Label htmlFor={`amount-${amt}`} className="cursor-pointer font-medium">
                          ${amt}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="amount-custom" />
                      <Label htmlFor="amount-custom" className="cursor-pointer font-medium">
                        Custom
                      </Label>
                    </div>
                  </RadioGroup>

                  {amount === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount">Custom Amount ($)</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Donor Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="donor-name">Full Name</Label>
                    <Input id="donor-name" name="donorName" type="text" placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor-email">Email</Label>
                    <Input id="donor-email" name="donorEmail" type="email" placeholder="your@email.com" required />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Share why you're supporting STEM education..."
                    rows={3}
                  />
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="anonymous" name="isAnonymous" />
                  <Label htmlFor="anonymous" className="text-sm">
                    Make this donation anonymous
                  </Label>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Payment Information</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number">Card Number</Label>
                      <Input
                        id="card-number"
                        name="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" name="expiry" type="text" placeholder="MM/YY" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" name="cvc" type="text" placeholder="123" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" name="zip" type="text" placeholder="12345" required />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : `Donate $${amount === "custom" ? customAmount || "0" : amount}`}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  🔒 Your payment information is secure and encrypted. STEM Spark Academy is a 501(c)(3) nonprofit
                  organization.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
