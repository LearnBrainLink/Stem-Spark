"use client";
import React from "react";
import { Logo } from "@/components/logo";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 text-center">
      <Logo width={80} height={80} className="mb-6" />
      <h1 className="text-4xl font-bold text-brand-primary mb-4">Something went wrong</h1>
      <p className="text-lg text-brand-secondary mb-8">{error.message || "An unexpected error occurred."}</p>
      <button onClick={reset} className="px-6 py-3 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-secondary transition">Try Again</button>
    </div>
  );
}
