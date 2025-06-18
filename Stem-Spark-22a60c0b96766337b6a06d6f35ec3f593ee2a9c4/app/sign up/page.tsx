"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { enhancedSignUp } from "@/lib/enhanced-auth-actions"
import { Mail, Lock, User, CheckCircle, Loader2, ArrowLeft, School, Map, Globe, UserSquare, Calendar, Image as ImageIcon, UserCircle, KeyRound } from "lucide-react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import Image from "next/image"

const roles = [
	{ value: "intern", label: "Intern", desc: "For those ready to dive deep into practical experience!" },
	{ value: "student", label: "Student", desc: "For our core learners focused on courses and lessons!" },
	{ value: "parent", label: "Parent", desc: "For guardians who want to support and monitor their learner's journey!" },
]

const securityQuestions = [
	"What is your favorite book?",
	"What was the name of your first pet?",
	"What is your mother's maiden name?",
	"What city were you born in?",
]

function ProgressBar({ step }: { step: number }) {
	return (
		<div className="w-full flex items-center mb-8">
			<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
				<div className={`h-full transition-all duration-500 ${step >= 3 ? 'bg-green-500' : step === 2 ? 'bg-blue-500' : 'bg-purple-500'}`} style={{ width: `${step * 33.33}%` }} />
			</div>
			<div className="ml-4 text-sm text-gray-600">Step {step} of 3</div>
		</div>
	)
}

const MotivationalSection = () => (
	<div className="w-full flex flex-col items-center justify-center text-center mb-8 mt-8">
		<p className="text-xl lg:text-2xl text-blue-100 max-w-md mx-auto leading-relaxed">
			Unlock your potential with cutting-edge education and innovation
		</p>
		<div className="flex flex-wrap justify-center gap-4 pt-4">
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

export default function SignUpPage() {
	const [step, setStep] = useState(1)
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [selectedRole, setSelectedRole] = useState("")
	const [registrationCode, setRegistrationCode] = useState("")
	const [personalInfo, setPersonalInfo] = useState({
		fullName: "",
		dob: "",
		email: "",
		schoolName: "",
		grade: "",
		country: "",
		state: "",
	})
	const [accountInfo, setAccountInfo] = useState({
		username: "",
		password: "",
		confirmPassword: "",
		securityQuestion: securityQuestions[0],
		securityAnswer: "",
		profilePic: null as File | null,
	})
	const [passwordStrength, setPasswordStrength] = useState("")

	// ... Password strength checker, handlers, and step navigation ...

	// Animated background gradient and floating particles
	const particles = Array.from({ length: 20 }, (_, i) => ({
		id: i,
		size: Math.random() * 40 + 20,
		left: Math.random() * 100,
		top: Math.random() * 100,
		duration: Math.random() * 20 + 10,
		delay: Math.random() * 5
	}))

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
							filter: 'blur(1px)'
						}}
					/>
				))}
			</div>
			{/* Main Content */}
			<div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
				<div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
					{/* Logo & Motivation Section */}
					<div className="flex flex-col items-center justify-center text-center lg:pr-8">
						<div className="mb-4 transform hover:scale-105 transition-transform duration-500">
							<Logo variant="mega" className="w-80 h-auto drop-shadow-2xl animate-pulse" />
						</div>
						<div className="mb-8 w-full flex flex-col items-center">
							<MotivationalSection />
						</div>
					</div>
					{/* Multi-step Form Section */}
					<div className="w-full max-w-md mx-auto">
						<Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl rounded-2xl overflow-hidden">
							<CardHeader className="space-y-1 pb-6">
								<ProgressBar step={step} />
								<CardTitle className="text-2xl font-bold text-center text-white">
									{step === 1 && "Your Secret Code & Account Type"}
									{step === 2 && "All About You"}
									{step === 3 && "Your Personal Space"}
								</CardTitle>
								<p className="text-center text-blue-100">
									{step === 1 && "Enter your registration code and select your account type."}
									{step === 2 && "Tell us about yourself and your school."}
									{step === 3 && "Set up your account and personalize your space!"}
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								{message && (
									<Alert className={`mb-6 ${message.type === "error" ? "border-red-300 bg-red-50 text-red-800" : "border-green-300 bg-green-50 text-green-800"}`}>
										<AlertDescription className="font-medium flex items-center gap-2">
											{message.type === "success" && <CheckCircle className="w-5 h-5" />}
											{message.text}
										</AlertDescription>
									</Alert>
								)}
								{/* Step 1: Registration Code & Role Selection */}
								{step === 1 && (
									<form onSubmit={e => { e.preventDefault(); setStep(2); }} className="space-y-6">
										<div className="flex flex-col md:flex-row gap-6 items-center justify-center">
											<div className="flex-1">
												<Label htmlFor="registration-code">Registration Code</Label>
												<Input id="registration-code" name="registrationCode" placeholder="Enter code if provided" value={registrationCode} onChange={e => setRegistrationCode(e.target.value)} />
											</div>
											<div className="flex-1">
												<Label htmlFor="role">Account Type *</Label>
												<Select name="role" required onValueChange={setSelectedRole} value={selectedRole}>
													<SelectTrigger className="h-12 text-base border-2 border-blue-400 bg-white/80 shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-xl font-semibold text-blue-900">
														<SelectValue placeholder="Select your account type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="intern" className="font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-all duration-150">Intern (Recommended)</SelectItem>
														<SelectItem value="student">Student</SelectItem>
														<SelectItem value="parent">Parent</SelectItem>
													</SelectContent>
												</Select>
												{selectedRole && <p className="text-xs text-gray-500 mt-1">{roles.find(r => r.value === selectedRole)?.desc}</p>}
											</div>
										</div>
										<div className="flex flex-col items-center mt-4">
											<Image src="/images/welcome-illustration.svg" alt="Welcome" width={120} height={120} className="mb-2" />
											<Link href="/getting-started" className="text-blue-600 underline text-sm">Getting Started Guide</Link>
										</div>
										<Button type="submit" className="w-full mt-4">Next</Button>
									</form>
								)}
								{/* Step 2: Personal Information */}
								{step === 2 && (
									<form onSubmit={e => { e.preventDefault(); setStep(3); }} className="space-y-6">
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="fullName">Full Name *</Label>
												<div className="relative">
													<User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="fullName" name="fullName" type="text" placeholder="Your full name" className="pl-10 h-12 text-base" required value={personalInfo.fullName} onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="dob">Date of Birth *</Label>
												<div className="relative">
													<Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="dob" name="dob" type="date" className="pl-10 h-12 text-base" required value={personalInfo.dob} onChange={e => setPersonalInfo({ ...personalInfo, dob: e.target.value })} />
												</div>
											</div>
										</div>
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="email">Email *</Label>
												<div className="relative">
													<Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="email" name="email" type="email" placeholder="your@email.com" className="pl-10 h-12 text-base" required value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="schoolName">School Name *</Label>
												<Input id="schoolName" name="schoolName" type="text" placeholder="Your school's name" className="h-12 text-base" required value={personalInfo.schoolName} onChange={e => setPersonalInfo({ ...personalInfo, schoolName: e.target.value })} />
											</div>
											<div className="space-y-2">
												<Label htmlFor="grade">Grade Level *</Label>
												<Select name="grade" value={personalInfo.grade} onValueChange={(val: string) => setPersonalInfo({ ...personalInfo, grade: val })} required>
													<SelectTrigger className="h-12 text-base">
														<SelectValue placeholder="Select your grade" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="5">5th Grade</SelectItem>
														<SelectItem value="6">6th Grade</SelectItem>
														<SelectItem value="7">7th Grade</SelectItem>
														<SelectItem value="8">8th Grade</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="country">Country *</Label>
												<div className="relative">
													<Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="country" name="country" type="text" placeholder="e.g. United States" className="pl-10 h-12 text-base" required value={personalInfo.country} onChange={e => setPersonalInfo({ ...personalInfo, country: e.target.value })} />
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="state">State/Province *</Label>
												<div className="relative">
													<Map className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="state" name="state" type="text" placeholder="e.g. California" className="pl-10 h-12 text-base" required value={personalInfo.state} onChange={e => setPersonalInfo({ ...personalInfo, state: e.target.value })} />
												</div>
											</div>
										</div>
										{/* Parent/Guardian Info for Students */}
										{selectedRole === "student" && (
												<div className="grid md:grid-cols-2 gap-6 mt-4 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
													<div className="space-y-2">
														<Label htmlFor="parentName">Parent/Guardian Name *</Label>
														<Input id="parentName" name="parentName" type="text" placeholder="Parent or guardian's full name" className="h-12 text-base" required value={personalInfo.parentName || ""} onChange={e => setPersonalInfo({ ...personalInfo, parentName: e.target.value })} />
													</div>
													<div className="space-y-2">
														<Label htmlFor="parentEmail">Parent/Guardian Email *</Label>
														<Input id="parentEmail" name="parentEmail" type="email" placeholder="Parent or guardian's email" className="h-12 text-base" required value={personalInfo.parentEmail || ""} onChange={e => setPersonalInfo({ ...personalInfo, parentEmail: e.target.value })} />
													</div>
													<div className="space-y-2 md:col-span-2">
														<Label htmlFor="parentPhone">Parent/Guardian Phone</Label>
														<Input id="parentPhone" name="parentPhone" type="tel" placeholder="(optional)" className="h-12 text-base" value={personalInfo.parentPhone || ""} onChange={e => setPersonalInfo({ ...personalInfo, parentPhone: e.target.value })} />
													</div>
												</div>
											)}
										<div className="flex justify-between mt-6">
											<Button type="button" className="border border-gray-300" onClick={() => setStep(1)}>Back</Button>
											<Button type="submit">Next</Button>
										</div>
									</form>
								)}
								{/* Step 3: Account Setup */}
								{step === 3 && (
									<form onSubmit={e => { e.preventDefault(); /* handle final submit here */ }} className="space-y-6">
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="username">Username *</Label>
												<div className="relative">
													<UserCircle className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="username" name="username" type="text" placeholder="Choose a username" className="pl-10 h-12 text-base" required value={accountInfo.username} onChange={e => setAccountInfo({ ...accountInfo, username: e.target.value })} />
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="profilePic">Profile Picture</Label>
												<div className="relative flex items-center gap-2">
													<Input id="profilePic" name="profilePic" type="file" accept="image/*" className="h-12 text-base" onChange={e => setAccountInfo({ ...accountInfo, profilePic: e.target.files?.[0] || null })} />
													<ImageIcon className="h-6 w-6 text-gray-400" />
												</div>
											</div>
										</div>
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="password">Password *</Label>
												<div className="relative">
													<KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10 h-12 text-base" minLength={8} required value={accountInfo.password} onChange={e => setAccountInfo({ ...accountInfo, password: e.target.value })} />
													{/* Password strength checker UI here */}
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="confirmPassword">Confirm Password *</Label>
												<div className="relative">
													<Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
													<Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" className="pl-10 h-12 text-base" minLength={8} required value={accountInfo.confirmPassword} onChange={e => setAccountInfo({ ...accountInfo, confirmPassword: e.target.value })} />
												</div>
											</div>
										</div>
										<div className="grid md:grid-cols-2 gap-6">
											<div className="space-y-2">
												<Label htmlFor="securityQuestion">Security Question *</Label>
												<Select name="securityQuestion" value={accountInfo.securityQuestion} onValueChange={(val: string) => setAccountInfo({ ...accountInfo, securityQuestion: val })}>
													<SelectTrigger className="h-12 text-base">
														<SelectValue placeholder="Select a question" />
													</SelectTrigger>
													<SelectContent>
														{securityQuestions.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
													</SelectContent>
												</Select>
											</div>
											<div className="space-y-2">
												<Label htmlFor="securityAnswer">Answer *</Label>
												<Input id="securityAnswer" name="securityAnswer" type="text" placeholder="Your answer" className="h-12 text-base" required value={accountInfo.securityAnswer} onChange={e => setAccountInfo({ ...accountInfo, securityAnswer: e.target.value })} />
											</div>
										</div>
										<div className="flex flex-col items-center mt-4">
											<p className="text-sm text-gray-600 mb-2">We'll send a verification email to confirm your address.</p>
											<Link href="/privacy" className="text-blue-600 underline text-xs">Privacy Policy</Link>
										</div>
										<div className="flex justify-between mt-6">
											<Button type="button" className="border border-gray-300" onClick={() => setStep(2)}>Back</Button>
											<Button type="submit">Finish</Button>
										</div>
									</form>
								)}
							</CardContent>
						</Card>
						<div className="text-center mt-6">
							<Link href="/login" className="text-sm text-gray-700 hover:text-blue-700 transition-colors inline-flex items-center">
								<ArrowLeft className="w-4 h-4 mr-1" />
								Already have an account? Sign In
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
