import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function ParentPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8">
      <header className="flex items-center gap-4 mb-8">
        <Logo width={48} height={48} />
        <h1 className="text-3xl font-bold text-brand-primary">Parent/Guardian Portal</h1>
      </header>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-brand-secondary">Monitor & Support Your Learner</h2>
        <p className="mb-6 text-gray-700">Track your student’s progress, communicate with instructors, and access helpful resources.</p>
        {/* TODO: Add progress monitoring, alerts, and communication tools here */}
        <div className="text-center text-gray-400">Coming soon: Progress dashboard, alerts, and parent resources!</div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
