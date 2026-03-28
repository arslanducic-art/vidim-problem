"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signInWithGoogle, signInWithEmail } from "@/lib/auth";
import { FirebaseError } from "firebase/app";

const firebaseErrorMap: Record<string, string> = {
  "auth/wrong-password": "Pogrešna lozinka. Pokušaj ponovo ili resetuj lozinku.",
  "auth/user-not-found": "Ne postoji račun s ovom email adresom.",
  "auth/invalid-credential": "Pogrešan email ili lozinka.",
  "auth/too-many-requests": "Previše neuspješnih pokušaja. Pokušaj ponovo za nekoliko minuta.",
  "auth/popup-blocked": "Popup je blokiran. Dozvoli popupove u postavkama preglednika.",
  "auth/network-request-failed": "Nema internet veze. Pokušaj ponovo.",
};

function getErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    return firebaseErrorMap[err.code] ?? "Došlo je do greške. Pokušaj ponovo.";
  }
  return "Došlo je do greške. Pokušaj ponovo.";
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") ?? "/mapa";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email) e.email = "Unesite email adresu";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Email adresa nije ispravna";
    if (!password) e.password = "Unesite lozinku";
    return e;
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setErrors({});
    try {
      await signInWithEmail(email, password);
      router.push(returnUrl);
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
      router.push(returnUrl);
    } catch (err) {
      setErrors({ form: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ background: "var(--background)", color: "var(--foreground)", minHeight: "100svh" }}
      className="flex flex-col"
    >
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button
          onClick={() => router.back()}
          style={{ background: "var(--secondary)", borderRadius: "22px" }}
          className="w-11 h-11 flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-11" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-12 flex flex-col">

        {/* Header */}
        <div className="flex flex-col gap-3 mt-6 mb-10">
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.2, color: "var(--foreground)" }}>
            Prijava
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            Dobrodošli natrag! Unesite svoje podatke za pristup računu.
          </p>
        </div>

        {/* Form error */}
        {errors.form && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-xl)" }}
            className="p-3 mb-4">
            <p style={{ fontSize: 14, color: "var(--destructive)" }}>{errors.form}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                background: errors.email ? "#fef2f2" : "var(--secondary)",
                borderRadius: "var(--radius-xl)",
                height: 56,
                border: errors.email ? "1px solid #fca5a5" : "1px solid transparent",
              }}
              className="flex items-center px-5 gap-3"
            >
              <Mail size={20} color="var(--muted-foreground)" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Vaša email adresa"
                style={{
                  flex: 1, fontSize: 16, fontWeight: 500, background: "transparent",
                  outline: "none", color: "var(--foreground)",
                }}
                className="placeholder:text-[var(--muted-foreground)]"
              />
            </div>
            {errors.email && <p style={{ fontSize: 12, color: "var(--destructive)", paddingLeft: 4 }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div
              style={{
                background: errors.password ? "#fef2f2" : "var(--secondary)",
                borderRadius: "var(--radius-xl)",
                height: 56,
                border: errors.password ? "1px solid #fca5a5" : "1px solid transparent",
              }}
              className="flex items-center px-5 gap-3"
            >
              <Lock size={20} color="var(--muted-foreground)" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Vaša lozinka"
                style={{
                  flex: 1, fontSize: 16, fontWeight: 500, background: "transparent",
                  outline: "none", color: "var(--foreground)",
                }}
                className="placeholder:text-[var(--muted-foreground)]"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword
                  ? <Eye size={20} color="var(--muted-foreground)" />
                  : <EyeOff size={20} color="var(--muted-foreground)" />}
              </button>
            </div>
            {errors.password && <p style={{ fontSize: 12, color: "var(--destructive)", paddingLeft: 4 }}>{errors.password}</p>}
          </div>

          {/* Forgot password */}
          <Link
            href="/zaboravljena-lozinka"
            style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", alignSelf: "flex-end" }}
          >
            Zaboravljena lozinka?
          </Link>

          {/* Actions */}
          <div className="flex flex-col mt-4 gap-0">
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--primary)", color: "var(--primary-foreground)",
                borderRadius: "var(--radius-xl)", height: 56,
                fontSize: 16, fontWeight: 700,
              }}
              className="w-full flex items-center justify-center disabled:opacity-50"
            >
              {loading ? "Prijavljivanje..." : "Prijavi se"}
            </button>

            <div className="flex items-center gap-4 my-8">
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-foreground)" }}>ILI</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                background: "var(--secondary)", color: "var(--foreground)",
                borderRadius: "var(--radius-xl)", height: 56,
                fontSize: 16, fontWeight: 700,
                border: "1px solid var(--border)",
              }}
              className="w-full flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Nastavi s Google-om
            </button>
          </div>
        </form>

        {/* Footer */}
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--muted-foreground)", textAlign: "center", marginTop: 48 }}>
          Nemate račun?{" "}
          <Link href="/registracija" style={{ color: "var(--foreground)", fontWeight: 700 }}>
            Registrirajte se
          </Link>
        </p>
      </div>
    </div>
  );
}
