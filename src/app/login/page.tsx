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
              }}
              className="w-full flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <div
                style={{
                  width: 24, height: 24, borderRadius: 12,
                  background: "var(--foreground)", color: "var(--background)",
                  fontSize: 14, fontWeight: 800,
                }}
                className="flex items-center justify-center flex-shrink-0"
              >
                G
              </div>
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
