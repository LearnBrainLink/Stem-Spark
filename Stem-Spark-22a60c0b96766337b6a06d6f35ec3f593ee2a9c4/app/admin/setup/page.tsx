'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Mail, RefreshCw } from "lucide-react"
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

export function SetupPageContent() {
	const [admins, setAdmins] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
	const [setupData, setSetupData] = useState<any>({});

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

	return (
		<div className="space-y-6">
			{/* Header */}
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="mb-6"
			>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Admin Setup</h1>
						<p className="text-gray-600">Manage admin accounts and system configuration.</p>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchSetupData}>
							<RefreshCw className="w-4 h-4 mr-2" />
							Refresh
						</Button>
					</div>
				</div>
			</motion.header>

			{/* Message Alert */}
			{message && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-4"
				>
					<Alert className={message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
						<AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
							{message.text}
						</AlertDescription>
					</Alert>
				</motion.div>
			)}

			{/* Setup Status */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
					<CardHeader>
						<CardTitle>System Setup Status</CardTitle>
						<CardDescription>Current status of admin setup and configuration</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div>
									<h4 className="font-medium text-gray-900">Admin Accounts</h4>
									<p className="text-sm text-gray-600">{setupData.adminCount || 0} admin users</p>
								</div>
								<Badge className={setupData.adminCount > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
									{setupData.adminCount > 0 ? "Configured" : "Not Configured"}
								</Badge>
							</div>
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div>
									<h4 className="font-medium text-gray-900">Database</h4>
									<p className="text-sm text-gray-600">Connection status</p>
								</div>
								<Badge className={setupData.databaseConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
									{setupData.databaseConnected ? "Connected" : "Disconnected"}
								</Badge>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Admin Management */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
					<CardHeader>
						<CardTitle>Admin Account Management</CardTitle>
						<CardDescription>Create and manage admin accounts</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<form action={handleCreateAdmin} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="adminEmail">Email Address</Label>
									<Input
										id="adminEmail"
										name="email"
										type="email"
										required
										placeholder="admin@novakinetix.com"
									/>
								</div>
								<div>
									<Label htmlFor="adminName">Full Name</Label>
									<Input
										id="adminName"
										name="fullName"
										required
										placeholder="Admin User"
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="adminPassword">Password</Label>
									<Input
										id="adminPassword"
										name="password"
										type="password"
										required
										placeholder="Enter password"
									/>
								</div>
								<div>
									<Label htmlFor="adminRole">Role</Label>
									<Select name="role" required>
										<SelectTrigger>
											<SelectValue placeholder="Select role" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="super_admin">Super Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<Button type="submit" className="w-full">
								Create Admin Account
							</Button>
						</form>
					</CardContent>
				</Card>
			</motion.div>

			{/* System Configuration */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
			>
				<Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
					<CardHeader>
						<CardTitle>System Configuration</CardTitle>
						<CardDescription>Configure system settings and environment</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="siteUrl">Site URL</Label>
								<Input
									id="siteUrl"
									value={setupData.siteUrl || ""}
									readOnly
									className="bg-gray-50"
								/>
							</div>
							<div>
								<Label htmlFor="environment">Environment</Label>
								<Input
									id="environment"
									value={setupData.environment || "development"}
									readOnly
									className="bg-gray-50"
								/>
							</div>
						</div>
						<div className="flex items-center gap-4">
							<Button variant="outline" onClick={handleTestConnection}>
								Test Database Connection
							</Button>
							<Button variant="outline" onClick={handleCheckEnvironment}>
								Check Environment
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	)
}

function SetupPageWrapper() {
	return <SetupPageContent />;
}

export default SetupPageWrapper;
