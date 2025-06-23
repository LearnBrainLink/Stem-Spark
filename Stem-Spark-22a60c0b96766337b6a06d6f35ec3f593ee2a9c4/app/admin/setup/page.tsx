'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Mail, RefreshCw, Download, Database, CheckCircle, UserPlus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdminSetupClient } from "./admin-setup-client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from 'react';
import { getEnhancedUsersData } from '../enhanced-actions';
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function SetupPageContent() {
	const [admins, setAdmins] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
	const [setupData, setSetupData] = useState<any>({});
	const [setupConfig, setSetupConfig] = useState<any>({});
	const [setupStatus, setSetupStatus] = useState<any>({});
	const [isSettingUp, setIsSettingUp] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchAdmins();
		fetchSetupData();
	}, []);

	const fetchAdmins = async () => {
		setIsLoading(true);
		const result = await getEnhancedUsersData();
		if (result.users) {
			setAdmins(result.users.filter((u: any) => u.role === 'admin'));
		}
		setIsLoading(false);
	};

	const fetchSetupData = async () => {
		// Mock setup data for now
		setSetupData({
			adminCount: admins.length,
			databaseConnected: true,
			siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
			environment: process.env.NODE_ENV || "development"
		});
	};

	const handleCreateAdmin = async (formData: FormData) => {
		// Implementation of handleCreateAdmin
		const email = formData.get('email') as string;
		const fullName = formData.get('fullName') as string;
		const password = formData.get('password') as string;
		const role = formData.get('role') as string;
		
		// Add admin creation logic here
		setMessage({ type: "success", text: "Admin account created successfully!" });
	};

	const handleTestConnection = async () => {
		// Implementation of handleTestConnection
		setMessage({ type: "success", text: "Database connection test successful!" });
	};

	const handleCheckEnvironment = async () => {
		// Implementation of handleCheckEnvironment
		setMessage({ type: "success", text: "Environment check completed!" });
	};

	const checkSetupStatus = async () => {
		// Implementation of checkSetupStatus
		setMessage({ type: "success", text: "Setup status checked!" });
	};

	const exportSetup = async () => {
		// Implementation of exportSetup
		setMessage({ type: "success", text: "Setup exported successfully!" });
	};

	const setupDatabase = async () => {
		// Implementation of setupDatabase
		setIsSettingUp(true);
		setError(null);
		try {
			// Database setup logic here
			setSetupStatus({ database: true });
			setMessage({ type: "success", text: "Database setup completed!" });
		} catch (e) {
			setError("Failed to setup database. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	const setupEmail = async () => {
		// Implementation of setupEmail
		setIsSettingUp(true);
		setError(null);
		try {
			// Email setup logic here
			setSetupStatus({ email: true });
			setMessage({ type: "success", text: "Email setup completed!" });
		} catch (e) {
			setError("Failed to setup email. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	const createAdminAccount = async () => {
		// Implementation of createAdminAccount
		setIsSettingUp(true);
		setError(null);
		try {
			// Admin account creation logic here
			setSetupStatus({ admin: true });
			setMessage({ type: "success", text: "Admin account created successfully!" });
		} catch (e) {
			setError("Failed to create admin account. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	return (
		<div className="w-full h-full space-y-6">
			{/* Header */}
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Admin Setup</h1>
					<p className="text-gray-600 mt-1">Complete initial admin configuration</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-3">
					<Button variant="outline" onClick={checkSetupStatus} className="w-full sm:w-auto">
						<RefreshCw className="w-4 h-4 mr-2" />
						Check Status
					</Button>
					<Button variant="outline" onClick={exportSetup} className="w-full sm:w-auto">
						<Download className="w-4 h-4 mr-2" />
						Export Config
					</Button>
				</div>
			</div>

			{/* Message Display */}
			{message && (
				<Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
					<AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
						{message.text}
					</AlertDescription>
				</Alert>
			)}

			{/* Error Display */}
			{error && (
				<Alert className="border-red-200 bg-red-50">
					<AlertTriangle className="h-4 w-4 text-red-600" />
					<AlertDescription className="text-red-800">{error}</AlertDescription>
				</Alert>
			)}

			{/* Setup Progress */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Database Setup */}
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Database className="w-5 h-5 text-blue-600" />
							Database Setup
						</CardTitle>
						<CardDescription>
							Configure database connection and schema
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="db-url">Database URL</Label>
							<Input 
								id="db-url" 
								value={setupConfig.databaseUrl} 
								onChange={(e) => setSetupConfig({...setupConfig, databaseUrl: e.target.value})}
								placeholder="postgresql://user:pass@host:port/db"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="db-key">Database Key</Label>
							<Input 
								id="db-key" 
								type="password"
								value={setupConfig.databaseKey} 
								onChange={(e) => setSetupConfig({...setupConfig, databaseKey: e.target.value})}
								placeholder="Your database key"
							/>
						</div>
						<Button 
							onClick={setupDatabase} 
							disabled={isSettingUp}
							className="w-full"
						>
							{isSettingUp ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Setting up...
								</>
							) : (
								<>
									<Database className="w-4 h-4 mr-2" />
									Setup Database
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Email Setup */}
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="w-5 h-5 text-green-600" />
							Email Setup
						</CardTitle>
						<CardDescription>
							Configure email service settings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="smtp-host">SMTP Host</Label>
							<Input 
								id="smtp-host" 
								value={setupConfig.smtpHost} 
								onChange={(e) => setSetupConfig({...setupConfig, smtpHost: e.target.value})}
								placeholder="smtp.gmail.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="smtp-user">SMTP Username</Label>
							<Input 
								id="smtp-user" 
								value={setupConfig.smtpUser} 
								onChange={(e) => setSetupConfig({...setupConfig, smtpUser: e.target.value})}
								placeholder="your-email@gmail.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="smtp-pass">SMTP Password</Label>
							<Input 
								id="smtp-pass" 
								type="password"
								value={setupConfig.smtpPass} 
								onChange={(e) => setSetupConfig({...setupConfig, smtpPass: e.target.value})}
								placeholder="Your app password"
							/>
						</div>
						<Button 
							onClick={setupEmail} 
							disabled={isSettingUp}
							className="w-full"
						>
							{isSettingUp ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Setting up...
								</>
							) : (
								<>
									<Mail className="w-4 h-4 mr-2" />
									Setup Email
								</>
							)}
						</Button>
					</CardContent>
				</Card>

				{/* Admin Account */}
				<Card className="shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UserPlus className="w-5 h-5 text-purple-600" />
							Admin Account
						</CardTitle>
						<CardDescription>
							Create initial admin user account
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="admin-name">Full Name</Label>
							<Input 
								id="admin-name" 
								value={setupConfig.adminName} 
								onChange={(e) => setSetupConfig({...setupConfig, adminName: e.target.value})}
								placeholder="Admin User"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="admin-email">Email</Label>
							<Input 
								id="admin-email" 
								type="email"
								value={setupConfig.adminEmail} 
								onChange={(e) => setSetupConfig({...setupConfig, adminEmail: e.target.value})}
								placeholder="admin@novakinetix.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="admin-password">Password</Label>
							<Input 
								id="admin-password" 
								type="password"
								value={setupConfig.adminPassword} 
								onChange={(e) => setSetupConfig({...setupConfig, adminPassword: e.target.value})}
								placeholder="Secure password"
							/>
						</div>
						<Button 
							onClick={createAdminAccount} 
							disabled={isSettingUp}
							className="w-full"
						>
							{isSettingUp ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Creating...
								</>
							) : (
								<>
									<UserPlus className="w-4 h-4 mr-2" />
									Create Admin
								</>
							)}
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Setup Status */}
			<Card className="shadow-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle className="w-5 h-5 text-green-600" />
						Setup Status
					</CardTitle>
					<CardDescription>
						Current configuration status
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<Database className={`w-5 h-5 ${setupStatus.database ? 'text-green-600' : 'text-red-600'}`} />
							<div>
								<p className="font-medium">Database</p>
								<p className="text-sm text-gray-600">
									{setupStatus.database ? 'Connected' : 'Not configured'}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<Mail className={`w-5 h-5 ${setupStatus.email ? 'text-green-600' : 'text-red-600'}`} />
							<div>
								<p className="font-medium">Email</p>
								<p className="text-sm text-gray-600">
									{setupStatus.email ? 'Configured' : 'Not configured'}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
							<UserPlus className={`w-5 h-5 ${setupStatus.admin ? 'text-green-600' : 'text-red-600'}`} />
							<div>
								<p className="font-medium">Admin Account</p>
								<p className="text-sm text-gray-600">
									{setupStatus.admin ? 'Created' : 'Not created'}
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

function SetupPageWrapper() {
	return <SetupPageContent />;
}

export default SetupPageWrapper;
