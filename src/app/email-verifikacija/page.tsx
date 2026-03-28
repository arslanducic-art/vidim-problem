"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resendVerificationEmail } from "@/lib/auth";

export default function EmailVerifikacijaPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleResend() {
    setLoading(true);
    setError("");
    try {
      await resendVerificationEmail();
      setResent(true);
    } catch {
      setError("Greška pri slanju emaila. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 mb-6">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Provjeri email</h1>

        <p className="text-gray-500 mb-2">
          Poslali smo ti email na
        </p>
        {email && (
          <p className="font-semibold text-gray-800 mb-4">{email}</p>
        )}
        <p className="text-gray-500 text-sm mb-8">
          Provjeri inbox i klikni na link za potvrdu. Nakon toga možeš prijaviti probleme i glasati.
        </p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left space-y-4 mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">1</div>
            <p className="text-sm text-gray-600">Otvori email od <span className="font-medium">noreply@prijavi-problem-sarajevo.firebaseapp.com</span></p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">2</div>
            <p className="text-sm text-gray-600">Klikni na link "Potvrdi email adresu"</p>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold mt-0.5">3</div>
            <p className="text-sm text-gray-600">Vrati se na platformu i prijavi problem</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {resent ? (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 mb-4">
            <p className="text-sm text-green-700">Email je ponovo poslan. Provjeri inbox.</p>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {loading ? "Slanje..." : "Nisam primio/la email — pošalji ponovo"}
          </button>
        )}
      </div>
    </main>
  );
}
