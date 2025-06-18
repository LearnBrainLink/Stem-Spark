"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Logo } from "@/components/logo"
import { enhancedSignUp } from "@/lib/enhanced-auth-actions"
import { Mail, Lock, User, CheckCircle, Loader2, ArrowLeft, School, Map, Globe, UserSquare } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedRole, setSelectedRole] = useState("")
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		grade: "",
		country: "",
		state: "",
		schoolName: "",
		parentName: "",
		parentEmail: "",
		parentPhone: "",
		relationship: "",
		role: "",
	})

	// Floating particles animation (copied from login)
	const particles = Array.from({ length: 20 }, (_, i) => ({
		id: i,
		size: Math.random() * 40 + 20,
		left: Math.random() * 100,
		top: Math.random() * 100,
		duration: Math.random() * 20 + 10,
		delay: Math.random() * 5,
	}))

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		})
	}

	const handleRoleChange = (value: string) => {
		setSelectedRole(value)
		setFormData({ ...formData, role: value })
	}

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setMessage(null)
		try {
			const form = new FormData(e.target as HTMLFormElement)
			const result = await enhancedSignUp(form)
			if (result?.error) {
				setMessage({ type: "error", text: result.error })
			} else if (result?.success) {
				setMessage({
					type: "success",
					text: result.message || "Account created successfully! Please check your email to verify your account.",
				})
			}
		} catch (error) {
			setMessage({
				type: "error",
				text: "An unexpected error occurred during signup. Please try again.",
			})
		} finally {
			setIsLoading(false)
		}
	}

	// Motivational section (copied from login)
	const MotivationalSection = () => (
		<div className="w-full flex flex-col items-center justify-center text-center">
			<p className="text-xl lg:text-2xl text-blue-100 max-w-md mx-auto leading-relaxed">
				Unlock your potential with cutting-edge education and innovation
			</p>
			<div className="flex flex-wrap justify-center gap-4 pt-2">
				<div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
					🚀 Advanced Learning
				</div>
				<div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
					🎓 Expert Instructors
				</div>
				<div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium">
					🌟 Career Growth
				</div>
			</div>
		</div>
	)

	return (
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
			{/* Animated Background */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
				{particles.map((particle) => (
					<div
						key={particle.id}
						className="absolute rounded-full bg-white/10 backdrop-blur-sm animate-bounce"
						style={{
							width: `${particle.size}px`,
							height: `${particle.size}px`,
							left: `${particle.left}%`,
							top: `${particle.top}%`,
							animationDuration: `${particle.duration}s`,
							animationDelay: `${particle.delay}s`,
							filter: "blur(1px)",
						}}
					/>
				))}
			</div>
			{/* Main Content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
				<div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4">
					{/* Logo and Motivation above the form, smaller logo, less gap */}
					<div className="flex flex-col items-center w-full gap-2">
						<Logo variant="mega" className="w-28 h-auto drop-shadow-2xl animate-pulse mb-0" />
						<MotivationalSection />
					</div>
					{/* Sign Up Form - wider */}
					<div className="w-full max-w-2xl mx-auto">
						<Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
							<CardHeader className="space-y-1 pb-6">
								<CardTitle className="text-2xl font-bold text-center text-white">
									Create Account
								</CardTitle>
								<p className="text-center text-blue-100">
									Join NovaKinetix Academy today.
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								{message && (
									<div
										className={`p-4 rounded-lg ${
											message.type === "success"
												? "border-green-200 bg-green-50 text-green-700"
												: "border-red-200 bg-red-50 text-red-700"
										}`}
									>
										<div className="flex items-center">
											{message.type === "success" ? (
												<CheckCircle className="h-4 w-4" />
											) : (
												<Loader2 className="h-4 w-4 animate-spin" />
											)}
											<p className="ml-2 text-sm">{message.text}</p>
										</div>
									</div>
								)}
								<form onSubmit={handleSignUp} className="space-y-4">
									<div className="space-y-2">
										<Label
											htmlFor="role"
											className="text-white font-medium"
										>
											I am a... *
										</Label>
										<select
											id="role"
											name="role"
											value={selectedRole}
											onChange={(e) => handleRoleChange(e.target.value)}
											className="w-full py-2 px-3 rounded border border-gray-300 text-gray-900 bg-white focus:border-blue-400 focus:ring-blue-400/20"
											required
										>
											<option value="">Select your role</option>
											<option value="student">Student</option>
											<option value="teacher">Teacher</option>
											<option value="parent">Parent</option>
										</select>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="fullName"
											className="text-white font-medium"
										>
											Full Name *
										</Label>
										<Input
											id="fullName"
											name="fullName"
											type="text"
											placeholder="Enter your full name"
											value={formData.fullName}
											onChange={handleInputChange}
											className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="text-white font-medium"
										>
											Email Address
										</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={handleInputChange}
												className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
												required
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="password"
											className="text-white font-medium"
										>
											Password
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
											<Input
												id="password"
												name="password"
												type="password"
												placeholder="Enter your password"
												value={formData.password}
												onChange={handleInputChange}
												className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
												required
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label
											htmlFor="confirmPassword"
											className="text-white font-medium"
										>
											Confirm Password
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300" />
											<Input
												id="confirmPassword"
												name="confirmPassword"
												type="password"
												placeholder="Confirm your password"
												value={formData.confirmPassword}
												onChange={handleInputChange}
												className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
												required
											/>
										</div>
									</div>
									{selectedRole === "student" && (
										<>
											<div className="border-t pt-6 space-y-6">
												<h3 className="text-xl font-semibold text-blue-100">
													Student Information
												</h3>
												<div className="grid md:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label
															htmlFor="grade"
															className="text-white font-medium"
														>
															Grade Level *
														</Label>
														<select
															id="grade"
															name="grade"
															value={formData.grade}
															onChange={handleInputChange}
															className="w-full py-2 px-3 rounded border border-gray-300 text-gray-900 bg-white focus:border-blue-400 focus:ring-blue-400/20"
															required
														>
															<option value="">Select your grade</option>
															<option value="5">5th Grade</option>
															<option value="6">6th Grade</option>
															<option value="7">7th Grade</option>
															<option value="8">8th Grade</option>
														</select>
													</div>
													<div className="space-y-2">
														<Label
															htmlFor="schoolName"
															className="text-white font-medium"
														>
															School Name
														</Label>
														<Input
															id="schoolName"
															name="schoolName"
															type="text"
															placeholder="Your school's name"
															value={formData.schoolName}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
														/>
													</div>
												</div>
												<div className="grid md:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label
															htmlFor="country"
															className="text-white font-medium"
														>
															Country *
														</Label>
														<Input
															id="country"
															name="country"
															type="text"
															placeholder="e.g. United States"
															value={formData.country}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
															required
														/>
													</div>
													<div className="space-y-2">
														<Label
															htmlFor="state"
															className="text-white font-medium"
														>
															State/Province *
														</Label>
														<Input
															id="state"
															name="state"
															type="text"
															placeholder="e.g. California"
															value={formData.state}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
															required
														/>
													</div>
												</div>
											</div>
											<div className="border-t pt-6 space-y-6">
												<h3 className="text-xl font-semibold text-blue-100">
													Parent/Guardian Information
												</h3>
												<div className="grid md:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label
															htmlFor="parentName"
															className="text-white font-medium"
														>
															Parent/Guardian Name *
														</Label>
														<Input
															id="parentName"
															name="parentName"
															type="text"
															placeholder="Parent's full name"
															value={formData.parentName}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
															required
														/>
													</div>
													<div className="space-y-2">
														<Label
															htmlFor="parentEmail"
															className="text-white font-medium"
														>
															Parent/Guardian Email *
														</Label>
														<Input
															id="parentEmail"
															name="parentEmail"
															type="email"
															placeholder="parent@email.com"
															value={formData.parentEmail}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
															required
														/>
													</div>
												</div>
												<div className="grid md:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label
															htmlFor="parentPhone"
															className="text-white font-medium"
														>
															Parent/Guardian Phone
														</Label>
														<Input
															id="parentPhone"
															name="parentPhone"
															type="tel"
															placeholder="(555) 123-4567"
															value={formData.parentPhone}
															onChange={handleInputChange}
															className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
														/>
													</div>
													<div className="space-y-2">
														<Label
															htmlFor="relationship"
															className="text-white font-medium"
														>
															Relationship to Student *
														</Label>
														<select
															id="relationship"
															name="relationship"
															value={formData.relationship}
															onChange={handleInputChange}
															className="w-full py-2 px-3 rounded border border-gray-300 text-gray-900 bg-white focus:border-blue-400 focus:ring-blue-400/20"
															required
														>
															<option value="">Select relationship</option>
															<option value="mother">Mother</option>
															<option value="father">Father</option>
															<option value="guardian">Guardian</option>
															<option value="other">Other</option>
														</select>
													</div>
												</div>
											</div>
										</>
									)}
									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating Account...
											</>
										) : (
											"Create Account"
										)}
									</Button>
									<p className="text-xs text-blue-200 text-center pt-2">
										By creating an account, you agree to our{" "}
										<Link
											href="/terms"
											className="underline text-blue-200"
										>
											Terms of Service
										</Link>{" "}
										and{" "}
										<Link
											href="/privacy"
											className="underline text-blue-200"
										>
											Privacy Policy
										</Link>
										.
									</p>
								</form>
								<div className="text-center mt-6">
									<Link
										href="/login"
										className="text-sm text-blue-200 hover:text-white transition-colors inline-flex items-center"
									>
										<ArrowLeft className="w-4 h-4 mr-1" />
										Already have an account? Sign In
									</Link>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
			{/* Custom animations */}
			<style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(30px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0) scale(1); }
          50% { transform: translateX(30px) scale(1.05); }
        }
        .animate-float1 { animation: float1 7s ease-in-out infinite; }
        .animate-float2 { animation: float2 9s ease-in-out infinite; }
        .animate-float3 { animation: float3 11s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce 2.5s infinite alternate; }
        @keyframes bounce {
          0% { transform: translateY(0); }
          100% { transform: translateY(-18px); }
        }
      `}</style>
		</div>
	)
}
