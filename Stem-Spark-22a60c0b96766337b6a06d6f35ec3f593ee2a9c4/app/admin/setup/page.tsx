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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { 
	setupDatabase as setupDatabaseAction, 
	setupEmail as setupEmailAction, 
	createAdminAccount as createAdminAccountAction, 
	createPredefinedAdmins, 
	verifyAdmins, 
	checkSetupStatus as checkSetupStatusAction, 
	exportSetupConfig as exportSetupConfigAction,
	testDatabaseConnection as testDatabaseConnectionAction 
} from './actions'

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
		checkStatus();
	}, []);

	const fetchAdmins = async () => {
		setIsLoading(true);
		try {
			// Use direct Supabase client approach
			const { createClient } = await import('@supabase/supabase-js')
			
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
			const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
			
			if (!supabaseUrl || !supabaseServiceKey) {
				setError('Missing Supabase configuration')
				return
			}

			const supabase = createClient(supabaseUrl, supabaseServiceKey, {
				auth: {
					autoRefreshToken: false,
					persistSession: false
				}
			})

			const { data: users, error } = await supabase
				.from('profiles')
				.select('*')
				.order('created_at', { ascending: false })

			if (error) {
				console.error('Error fetching users:', error)
				setError(error.message)
			} else {
				setAdmins(users?.filter((u: any) => u.role === 'admin') || []);
			}
		} catch (err) {
			console.error('Error in fetchAdmins:', err)
			setError('Failed to fetch admins')
		} finally {
			setIsLoading(false);
		}
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

	const checkStatus = async () => {
		try {
			const result = await checkSetupStatusAction();
			if (result.success) {
				setSetupStatus(result.status);
			}
		} catch (err) {
			console.error('Failed to check setup status:', err);
		}
	};

	const handleCreateAdmin = async (formData: FormData) => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const result = await createAdminAccountAction(formData);
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Admin account created successfully!" });
				fetchAdmins();
				checkStatus();
			} else {
				setError(result.error || "Failed to create admin account");
			}
		} catch (err) {
			setError("Failed to create admin account. Please try again.");
		} finally {
			setIsSettingUp(false);
		}
	};

	const handleTestConnection = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const result = await testDatabaseConnectionAction();
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Database connection test successful!" });
			} else {
				setError(result.error || "Database connection test failed");
			}
		} catch (err) {
			setError("Failed to test database connection");
		} finally {
			setIsSettingUp(false);
		}
	};

	const handleCheckEnvironment = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const result = await checkSetupStatusAction();
			
			if (result.success) {
				setMessage({ type: "success", text: "Environment check completed!" });
				setSetupStatus(result.status);
			} else {
				setError(result.error || "Environment check failed");
			}
		} catch (err) {
			setError("Failed to check environment");
		} finally {
			setIsSettingUp(false);
		}
	};

	const checkSetupStatus = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const result = await checkSetupStatusAction();
			
			if (result.success) {
				setMessage({ type: "success", text: "Setup status checked!" });
				setSetupStatus(result.status);
			} else {
				setError(result.error || "Failed to check setup status");
			}
		} catch (err) {
			setError("Failed to check setup status");
		} finally {
			setIsSettingUp(false);
		}
	};

	const exportSetup = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const result = await exportSetupConfigAction();
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Setup exported successfully!" });
				
				// Create downloadable file
				const configData = JSON.stringify(result.config, null, 2);
				const blob = new Blob([configData], { type: 'application/json' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `novakinetix-setup-${new Date().toISOString().split('T')[0]}.json`;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			} else {
				setError(result.error || "Failed to export setup");
			}
		} catch (err) {
			setError("Failed to export setup");
		} finally {
			setIsSettingUp(false);
		}
	};

	const setupDatabase = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const formData = new FormData();
			formData.append('databaseUrl', setupConfig.databaseUrl || '');
			formData.append('databaseKey', setupConfig.databaseKey || '');

			const result = await setupDatabaseAction(formData);
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Database setup completed!" });
				setSetupStatus({ ...setupStatus, database: true });
			} else {
				setError(result.error || "Failed to setup database");
			}
		} catch (err) {
			setError("Failed to setup database. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	const setupEmail = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const formData = new FormData();
			formData.append('smtpHost', setupConfig.smtpHost || '');
			formData.append('smtpUser', setupConfig.smtpUser || '');
			formData.append('smtpPass', setupConfig.smtpPass || '');

			const result = await setupEmailAction(formData);
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Email setup completed!" });
				setSetupStatus({ ...setupStatus, email: true });
			} else {
				setError(result.error || "Failed to setup email");
			}
		} catch (err) {
			setError("Failed to setup email. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	const createAdminAccount = async () => {
		try {
			setIsSettingUp(true);
			setError(null);
			setMessage(null);

			const formData = new FormData();
			formData.append('adminName', setupConfig.adminName || '');
			formData.append('adminEmail', setupConfig.adminEmail || '');
			formData.append('adminPassword', setupConfig.adminPassword || '');

			const result = await createAdminAccountAction(formData);
			
			if (result.success) {
				setMessage({ type: "success", text: result.message || "Admin account created successfully!" });
				setSetupStatus({ ...setupStatus, admin: true });
				fetchAdmins();
			} else {
				setError(result.error || "Failed to create admin account");
			}
		} catch (err) {
			setError("Failed to create admin account. Please try again later.");
		} finally {
			setIsSettingUp(false);
		}
	};

	return (
		<div className="admin-page-content space-y-6 p-0 m-0">
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
						<div className="flex gap-2">
							<Button 
								onClick={setupDatabase} 
								disabled={isSettingUp}
								className="flex-1"
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
							<Button 
								onClick={handleTestConnection} 
								disabled={isSettingUp}
								variant="outline"
								size="sm"
							>
								Test
							</Button>
						</div>
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

			{/* Predefined Admin Accounts */}
			<Card className="shadow-md">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5 text-indigo-600" />
						Predefined Admin Accounts
					</CardTitle>
					<CardDescription>
						Create all 4 predefined administrator accounts with secure credentials
					</CardDescription>
				</CardHeader>
				<CardContent>
					<AdminSetupClient adminAccounts={[]} />
				</CardContent>
			</Card>

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
					
					{/* Admin Count */}
					<div className="mt-4 p-3 bg-blue-50 rounded-lg">
						<div className="flex items-center gap-2">
							<Users className="w-4 h-4 text-blue-600" />
							<span className="font-medium">Admin Accounts:</span>
							<Badge variant="outline">{admins.length}</Badge>
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
