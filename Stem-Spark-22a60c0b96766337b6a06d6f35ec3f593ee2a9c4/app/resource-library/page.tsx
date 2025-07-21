import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function ResourceLibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-8">
      <header className="flex items-center gap-4 mb-8">
        <Logo width={48} height={48} />
        <h1 className="text-3xl font-bold text-brand-primary">Resource Library</h1>
      </header>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-4 text-brand-secondary">Learning Resources</h2>
        <p className="mb-6 text-gray-700">Explore extra materials, practice problems, guides, and interactive tutorials to boost your learning journey!</p>
        {/* TODO: Add resource search, filters, and resource cards here */}
        <div className="text-center text-gray-400">Coming soon: Powerful search, categories, and featured resources!</div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/dashboard">
          <button className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );
}
