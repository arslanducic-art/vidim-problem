"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MapPin, Share2 } from "lucide-react";

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
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 pb-8 items-center justify-center text-center">
      {/* Success icon */}
      <div
        style={{ background: "#f0fdf4", borderRadius: "50%", width: 80, height: 80, marginBottom: 24 }}
        className="flex items-center justify-center"
      >
        <CheckCircle size={44} color="#22c55e" />
      </div>

      <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--foreground)", marginBottom: 12 }}>
        Prijava poslana!
      </h2>

      <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5, marginBottom: 32, maxWidth: 300 }}>
        Tvoja prijava je proslijeđena nadležnoj službi. Rješavanje može potrajati 1–4 sedmice.
      </p>

      {/* Ticket ID */}
      <div
        style={{
          background: "var(--accent)", borderRadius: "var(--radius-xl)",
          padding: "20px 32px", marginBottom: 40,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-foreground)", marginBottom: 6, letterSpacing: "0.5px" }}>
          TICKET ID
        </p>
        <p style={{ fontSize: 28, fontWeight: 800, color: "var(--accent-foreground)", letterSpacing: "-0.5px" }}>
          {ticketId}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => router.push(`/mapa?report=${reportId}`)}
          style={{
            height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
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
