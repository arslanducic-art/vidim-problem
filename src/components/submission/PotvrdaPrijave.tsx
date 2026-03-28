"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, MapPin, Share2, CheckCircle } from "lucide-react";

interface Props {
  ticketId: string;
  reportId: string;
}

export function PotvrdaPrijave({ ticketId, reportId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/mapa?report=${reportId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col">
      {/* Top nav */}
      <div className="flex items-center justify-end px-6 py-4">
        <button
          onClick={() => router.push("/mapa")}
          style={{ background: "var(--secondary)", borderRadius: "22px", width: 44, height: 44 }}
          className="flex items-center justify-center"
        >
          <X size={22} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-40">
        {/* Success icon */}
        <div
          style={{ width: 96, height: 96, borderRadius: 48, background: "var(--success)", marginBottom: 32 }}
          className="flex items-center justify-center"
        >
          <CheckCircle size={48} color="var(--success-foreground)" strokeWidth={2.5} />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 16 }}>
          Prijava poslana!
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5, maxWidth: 300, marginBottom: 40 }}>
          Tvoja prijava je proslijeđena nadležnoj službi. Rješavanje može potrajati 1–4 sedmice.
        </p>

        {/* Ticket ID card */}
        <div
          style={{
            background: "var(--secondary)",
            borderRadius: "var(--radius-xl)",
            padding: "24px 40px",
            marginBottom: 16,
            width: "100%",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "1px", marginBottom: 8 }}>
            TICKET ID
          </p>
          <p style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", color: "var(--primary)" }}>
            {ticketId}
          </p>
        </div>

        <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 500, marginBottom: 0 }}>
          Sačuvaj ovaj broj za praćenje statusa prijave
        </p>
      </div>

      {/* Fixed bottom actions */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 32px", background: "linear-gradient(to top, var(--background) 60%, transparent)" }} className="flex flex-col gap-3">
        <button
          onClick={() => router.push(`/mapa?report=${reportId}`)}
          style={{
            height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
            boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 25%, transparent)",
          }}
          className="w-full flex items-center justify-center gap-2"
        >
          <MapPin size={20} />
          Vidi problem na mapi
        </button>
        <button
          onClick={handleShare}
          style={{
            height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--secondary)", color: "var(--foreground)",
            fontSize: 16, fontWeight: 700,
          }}
          className="w-full flex items-center justify-center gap-2"
        >
          <Share2 size={20} />
          {copied ? "Link kopiran! ✓" : "Podijeli prijavu"}
        </button>
      </div>
    </div>
  );
}
