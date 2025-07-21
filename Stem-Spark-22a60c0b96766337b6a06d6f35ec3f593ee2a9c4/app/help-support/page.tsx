import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function HelpSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8">
      <header className="flex items-center gap-4 mb-8">
        <Logo width={48} height={48} />
        <h1 className="text-3xl font-bold text-brand-primary">Help & Support</h1>
      </header>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-brand-secondary">How can we help you?</h2>
        <p className="mb-6 text-gray-700">Find answers to common questions, contact support, and share your feedback.</p>
        {/* TODO: Add FAQ, support contact, and feedback form here */}
        <div className="text-center text-gray-400">Coming soon: FAQ, live chat, and feedback system!</div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
