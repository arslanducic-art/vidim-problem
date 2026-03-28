"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
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
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "var(--radius-xl)" }} className="p-4">
            <p style={{ fontSize: 15, fontWeight: 600, color: "#166534" }}>
              Poslali smo link za reset lozinke na tvoj email.
            </p>
            <p style={{ fontSize: 14, color: "#166534", marginTop: 4, fontWeight: 500 }}>
              Provjeri inbox i spam folder.
            </p>
          </div>
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
