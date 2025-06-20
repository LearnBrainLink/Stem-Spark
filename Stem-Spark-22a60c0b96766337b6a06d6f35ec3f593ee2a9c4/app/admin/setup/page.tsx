'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Mail } from "lucide-react"
import Link from "next/link"
import { AdminSetupClient } from "./admin-setup-client"
import AdminLayout from '../layout'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Define admin accounts directly in the component
const ADMIN_ACCOUNTS = [
	{
		email: "admin@stemspark.academy",
		password: "STEMAdmin2024!",
		fullName: "Dr. Sarah Johnson",
		role: "Main Administrator",
		state: "California",
	},
	{
		email: "director@stemspark.academy",
		password: "STEMDirector2024!",
		fullName: "Prof. Michael Chen",
		role: "Program Director",
		state: "New York",
	},
	{
		email: "coordinator@stemspark.academy",
		password: "STEMCoord2024!",
		fullName: "Dr. Emily Rodriguez",
		role: "Education Coordinator",
		state: "Texas",
	},
	{
		email: "manager@stemspark.academy",
		password: "STEMManager2024!",
		fullName: "Prof. David Kim",
		role: "Content Manager",
		state: "Washington",
	},
]

export default function SetupPage() {
	return (
		<AdminLayout>
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
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<h1 className="text-4xl font-bold tracking-tight text-[var(--novakinetix-dark)]">Admin Setup</h1>
							<p className="text-gray-600">Manage admin accounts and permissions.</p>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
								Refresh
							</Button>
						</div>
					</div>
				</motion.header>

				<motion.div 
					className="grid grid-cols-1 md:grid-cols-2 gap-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Card className="border-0 shadow-md rounded-lg bg-white">
						<CardHeader className="pb-2">
							<CardTitle className="text-base font-semibold mb-0">Admin Accounts</CardTitle>
							<CardDescription className="text-xs text-gray-500">Manage admin user accounts</CardDescription>
						</CardHeader>
						<CardContent className="pt-0">
							<div className="space-y-1 text-xs">
								<div className="flex items-center justify-between">
									<Label htmlFor="admin-name">Admin Name</Label>
									<Input id="admin-name" placeholder="John Doe" className="text-xs px-2 py-1" />
								</div>
								<div className="flex items-center justify-between">
									<Label htmlFor="admin-role">Admin Role</Label>
									<Input id="admin-role" placeholder="Super Admin" className="text-xs px-2 py-1" />
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</AdminLayout>
	)
}
