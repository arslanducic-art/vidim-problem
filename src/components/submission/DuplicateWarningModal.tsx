"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
  onSupport: () => void;
  onProceed: () => void;
}

export function DuplicateWarningModal({ onSupport, onProceed }: Props) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)" }}
      className="flex items-end justify-center"
    >
      <div
        style={{
          background: "var(--background)",
          borderRadius: "24px 24px 0 0",
          width: "100%",
          maxWidth: 480,
          padding: "32px 24px 40px",
        }}
      >
        <div
          style={{ background: "var(--accent)", borderRadius: "50%", width: 56, height: 56, marginBottom: 20 }}
          className="flex items-center justify-center mx-auto"
        >
          <AlertTriangle size={28} color="var(--accent-foreground)" />
        </div>

        <h3
          style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", textAlign: "center", marginBottom: 12 }}
        >
          Sličan problem pronađen
        </h3>
        <p
          style={{ fontSize: 15, fontWeight: 500, color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.5, marginBottom: 32 }}
        >
          Sličan problem već postoji u blizini. Želiš li ga podržati glasom umjesto nove prijave?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onSupport}
            style={{
              height: 56, borderRadius: "var(--radius-xl)",
              background: "var(--primary)", color: "var(--primary-foreground)",
              fontSize: 16, fontWeight: 700,
            }}
            className="w-full flex items-center justify-center"
          >
            Podrži postojeću prijavu
          </button>
          <button
            onClick={onProceed}
            style={{
              height: 56, borderRadius: "var(--radius-xl)",
              background: "var(--secondary)", color: "var(--foreground)",
              fontSize: 16, fontWeight: 700,
            }}
            className="w-full flex items-center justify-center"
          >
            Ipak prijavi novi problem
          </button>
        </div>
      </div>
    </div>
  );
}
