"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { sendPasswordReset } from "@/lib/auth";

export default function ZaboravljenaLozinkaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Unesite ispravnu email adresu");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch {
      setError("Greška pri slanju emaila. Pokušaj ponovo.");
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
            Zaboravljena lozinka?
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            Unesite email adresu s kojom ste se registrirali. Poslat ćemo vam upute za ponovno postavljanje lozinke.
          </p>
        </div>

        {sent ? (
          <>
            {/* Success icon */}
            <div
              style={{
                width: 80, height: 80, borderRadius: 40,
                background: "var(--success)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: 48, marginBottom: 32,
              }}
            >
              <MailCheck size={40} color="var(--success-foreground)" />
            </div>

            {/* Header */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.2, margin: 0 }}>
                Provjerite email
              </h1>
              <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
                Poslali smo upute za ponovno postavljanje lozinke na vašu email adresu. Molimo provjerite i mapu neželjene pošte.
              </p>
            </div>

            {/* Actions */}
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
              <button
                onClick={() => router.push("/login")}
                style={{
                  width: "100%", height: 56,
                  borderRadius: "var(--radius-xl)",
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  fontSize: 16, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                Povratak na prijavu
              </button>

              <p style={{ textAlign: "center", marginTop: 32, fontSize: 15, fontWeight: 500, color: "var(--muted-foreground)" }}>
                Niste primili email?{" "}
                <button
                  onClick={async () => { setLoading(true); await sendPasswordReset(email).catch(() => {}); setLoading(false); }}
                  disabled={loading}
                  style={{ color: "var(--foreground)", fontWeight: 700, background: "none" }}
                >
                  {loading ? "Slanje..." : "Pošaljite ponovno"}
                </button>
              </p>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div
                style={{
                  background: error ? "#fef2f2" : "var(--secondary)",
                  borderRadius: "var(--radius-xl)", height: 56,
                  border: error ? "1px solid #fca5a5" : "1px solid transparent",
                }}
                className="flex items-center px-5 gap-3"
              >
                <Mail size={20} color="var(--muted-foreground)" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Vaša email adresa"
                  style={{ flex: 1, fontSize: 16, fontWeight: 500, background: "transparent", outline: "none", color: "var(--foreground)" }}
                  className="placeholder:text-[var(--muted-foreground)]"
                />
              </div>
              {error && <p style={{ fontSize: 12, color: "var(--destructive)", paddingLeft: 4 }}>{error}</p>}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-xl)", height: 56,
                  fontSize: 16, fontWeight: 700, width: "100%",
                }}
                className="flex items-center justify-center disabled:opacity-50"
              >
                {loading ? "Slanje..." : "Pošalji upute"}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--muted-foreground)", textAlign: "center", marginTop: "auto", paddingTop: 48 }}>
          Sjetili ste se lozinke?{" "}
          <Link href="/login" style={{ color: "var(--foreground)", fontWeight: 700 }}>
            Prijavite se
          </Link>
        </p>
      </div>
    </div>
  );
}
