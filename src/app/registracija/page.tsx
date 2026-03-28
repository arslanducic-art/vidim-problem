"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerWithEmail, signInWithGoogle } from "@/lib/auth";
import { FirebaseError } from "firebase/app";

const firebaseErrorMap: Record<string, string> = {
  "auth/email-already-in-use": "Ovaj email je već registrovan. Prijavi se ili resetuj lozinku.",
  "auth/weak-password": "Lozinka mora imati najmanje 6 karaktera.",
  "auth/popup-blocked": "Popup je blokiran. Dozvoli popupove u postavkama preglednika.",
  "auth/network-request-failed": "Nema internet veze. Pokušaj ponovo.",
};

function getErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return firebaseErrorMap[err.code] ?? "Došlo je do greške. Pokušaj ponovo.";
  }
  return "Došlo je do greške. Pokušaj ponovo.";
}

export default function RegistracijaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Unesite email adresu";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email adresa nije ispravna";
    if (!password) e.password = "Unesite lozinku";
    else if (password.length < 8) e.password = "Lozinka mora imati najmanje 8 karaktera";
    return e;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setErrors({});
    try {
      await registerWithEmail(email, password);
      router.push(`/email-verifikacija?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setErrors({});
    try {
      await signInWithGoogle();
      router.push("/mapa");
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Vidim Problem</h1>
          <p className="text-sm text-gray-500 mt-1">Prijavi komunalni problem u Kantonu Sarajevo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Kreiraj račun</h2>

          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{errors.form}</p>
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Nastavi s Googleom
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
              ili
            </div>
          </div>

          <form onSubmit={handleRegister} noValidate className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email adresa
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="ime@primjer.ba"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Lozinka
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                placeholder="Najmanje 8 karaktera"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Kreiranje računa..." : "Registruj se"}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Registracijom prihvataš uvjete korištenja platforme.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Već imaš račun?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Prijavi se
          </Link>
        </p>
      </div>
    </main>
  );
}
