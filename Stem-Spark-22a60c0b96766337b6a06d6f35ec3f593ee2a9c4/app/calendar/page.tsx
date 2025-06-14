import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8">
      <header className="flex items-center gap-4 mb-8">
        <Logo width={48} height={48} />
        <h1 className="text-3xl font-bold text-brand-primary">Academic Calendar</h1>
      </header>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-brand-secondary">Stay Organized</h2>
        <p className="mb-6 text-gray-700">View all your class schedules, assignment deadlines, exam dates, and important events in one place.</p>
        {/* TODO: Add calendar component and event management here */}
        <div className="text-center text-gray-400">Coming soon: Interactive calendar and event scheduling!</div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
