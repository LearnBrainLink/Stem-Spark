import React from "react";
import { Logo } from "@/components/logo";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-center animate-fade-in px-4 sm:px-8">
      <Logo width={80} height={80} className="mb-6 drop-shadow-2xl sm:mb-8 sm:w-[100px] sm:h-[100px]" />
      <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-primary mb-2 tracking-tight">404</h1>
      <p className="text-lg sm:text-2xl text-brand-secondary mb-6 font-semibold">Oops! The page you’re looking for doesn’t exist.</p>
      <div className="mb-8">
        <span className="inline-block bg-brand-primary/10 text-brand-primary px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-base sm:text-lg font-medium">
          Tip: Use the navigation bar to explore courses, resources, or return to the dashboard.
        </span>
      </div>
      <Link href="/" aria-label="Go Home">
        <span
          className="px-6 py-3 sm:px-8 sm:py-4 bg-brand-primary text-white rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:bg-brand-secondary transition focus:outline-none focus:ring-4 focus:ring-brand-primary/30 inline-block cursor-pointer"
          tabIndex={0}
          role="button"
        >
          Go Home
        </span>
      </Link>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
