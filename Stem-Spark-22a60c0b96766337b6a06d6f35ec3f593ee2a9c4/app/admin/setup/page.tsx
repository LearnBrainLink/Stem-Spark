'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Mail } from "lucide-react"
import Link from "next/link"
import { AdminSetupClient } from "./admin-setup-client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from 'react';
import { getEnhancedUsersData } from '../enhanced-actions';

export function SetupPageContent() {
	const [admins, setAdmins] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchAdmins();
	}, []);

	const fetchAdmins = async () => {
		setIsLoading(true);
		const result = await getEnhancedUsersData();
		if (result.users) {
			setAdmins(result.users.filter((u: any) => u.role === 'admin'));
		}
		setIsLoading(false);
	};

	return (
		<motion.div 
			className="space-y-8 p-2 sm:p-4 lg:p-6"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<motion.header
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
			>
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div>
						<h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Setup</h1>
						<p className="text-gray-600">Manage admin accounts and permissions.</p>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100" onClick={fetchAdmins}>
							Refresh
						</Button>
					</div>
				</div>
			</motion.header>

			<motion.div 
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<Card className="border-0 shadow-md rounded-lg bg-white">
					<CardHeader className="pb-1">
						<CardTitle className="text-base font-semibold mb-0">Admin Accounts</CardTitle>
						<CardDescription className="text-xs text-gray-500">Manage admin user accounts</CardDescription>
					</CardHeader>
					<CardContent className="pt-0">
						{isLoading ? (
							<div>Loading...</div>
						) : (
							<div className="space-y-2">
								{admins.map((admin, idx) => (
									<div key={admin.id || idx} className="flex items-center justify-between border-b border-gray-100 py-2">
										<div>
											<div className="font-semibold text-sm">{admin.full_name || admin.email}</div>
											<div className="text-xs text-gray-500">{admin.email}</div>
										</div>
										<Badge className="bg-red-100 text-red-800 border-red-200">Admin</Badge>
									</div>
								))}
								{admins.length === 0 && <div className="text-xs text-gray-500">No admin users found.</div>}
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	)
}

function SetupPageWrapper() {
	return <SetupPageContent />;
}

export default SetupPageWrapper;
