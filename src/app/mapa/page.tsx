"use client";

import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { MapPin, Plus, LogOut, User } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function MapaPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Logo />

        <div className="flex items-center gap-2">
          <div
            style={{ background: "var(--secondary)", borderRadius: 20, padding: "6px 12px" }}
            className="flex items-center gap-2"
          >
            <User size={14} color="var(--muted-foreground)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
              {user?.displayName ?? user?.email?.split("@")[0] ?? "Korisnik"}
            </span>
          </div>
          <button
            onClick={async () => { await signOut(); router.push("/login"); }}
            style={{ background: "var(--secondary)", borderRadius: 20, width: 36, height: 36 }}
            className="flex items-center justify-center"
          >
            <LogOut size={16} color="var(--muted-foreground)" />
          </button>
        </div>
      </div>

      {/* Map placeholder */}
      <div
        style={{ flex: 1, background: "var(--muted)", margin: "0 16px", borderRadius: "var(--radius-xl)", position: "relative" }}
        className="flex items-center justify-center"
      >
        <div className="text-center">
          <div
            style={{ background: "var(--secondary)", borderRadius: "50%", width: 64, height: 64, margin: "0 auto 16px" }}
            className="flex items-center justify-center"
          >
            <MapPin size={32} color="var(--muted-foreground)" />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
            Mapa dolazi uskoro
          </p>
          <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            Interaktivna mapa s prijavama
          </p>
        </div>
      </div>

      {/* FAB — Prijavi Problem */}
      <div className="px-6 py-6">
        <button
          onClick={() => router.push("/prijava")}
          style={{
            width: "100%", height: 60,
            background: "var(--primary)", color: "var(--primary-foreground)",
            borderRadius: "var(--radius-xl)",
            fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 20px rgba(249,115,22,0.35)",
          }}
          className="flex items-center justify-center gap-2"
        >
          <Plus size={22} />
          Prijavi Problem
        </button>
      </div>
    </div>
  );
}
