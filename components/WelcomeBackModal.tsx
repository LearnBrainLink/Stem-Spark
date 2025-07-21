"use client";
import React, { useState } from "react";

export default function WelcomeBackModal({ userName }: { userName: string }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none welcome-modal">
      <div className="bg-white/90 border-2 border-blue-400 shadow-2xl rounded-2xl px-8 py-8 flex flex-col items-center animate-fade-in-up pointer-events-auto" style={{ minWidth: "320px", maxWidth: "90vw" }}>
        <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome back, {userName}!</h2>
        <p className="text-lg text-blue-500 mb-2">We're glad to see you again. Ready to continue your journey?</p>
        <button
          className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all"
          onClick={() => setOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
