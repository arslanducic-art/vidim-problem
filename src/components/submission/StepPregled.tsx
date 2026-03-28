"use client";

import { useState } from "react";
import { MapPin, Tag, FileText, Loader2, ArrowLeft, Send } from "lucide-react";
import { checkDuplicate, createReport } from "@/lib/reports";
import { useAuth } from "@/context/AuthContext";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { useRouter } from "next/navigation";

interface Props {
  photos: File[];
  location: { lat: number; lng: number };
  category: string;
  categoryLabel: string;
  description: string;
  onBack: () => void;
  onSuccess: (ticketId: string, reportId: string) => void;
}

export function StepPregled({
  photos,
  location,
  category,
  categoryLabel,
  description,
  onBack,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [duplicateReportId, setDuplicateReportId] = useState<string | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  async function handleSubmit(skipDuplicateCheck = false) {
    if (!user) return;
    setError("");

    if (!skipDuplicateCheck) {
      setLoading(true);
      try {
        const dupe = await checkDuplicate(location.lat, location.lng, category);
        if (dupe) {
          setDuplicateReportId(dupe.id);
          setShowDuplicateModal(true);
          setLoading(false);
          return;
        }
      } catch {
        // Continue even if duplicate check fails
      }
    }

    setLoading(true);
    try {
      const result = await createReport({
        userId: user.uid,
        category,
        categoryLabel,
        description,
        location,
        photoFiles: photos,
      });
      onSuccess(result.ticketId, result.id);
    } catch {
      setError("Greška pri slanju prijave. Pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={{ background: "var(--background)", minHeight: "100svh", position: "relative" }} className="flex flex-col">
        {/* Top nav */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <button
            onClick={onBack}
            style={{ background: "var(--secondary)", borderRadius: "22px", width: 44, height: 44 }}
            className="flex items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>
          <button
            style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-foreground)" }}
            onClick={() => router.push("/mapa")}
          >
            Odustani
          </button>
        </div>

        {/* Progress: all 3 active on review step */}
        <div className="flex gap-1.5 px-6 mb-2">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--primary)" }} />
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-36">
          {/* Header */}
          <div style={{ padding: "24px 24px 32px" }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 12 }}>
              Pregled prijave
            </h1>
            <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
              Provjeri detalje prije slanja.
            </p>
          </div>

          {/* Review sections */}
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Photo section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Fotografije</span>
              <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
                {photos.map((file, index) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Fotografija problema ${index + 1}`}
                    style={{ height: 120, width: 160, borderRadius: "var(--radius-xl)", objectFit: "cover", flexShrink: 0 }}
                  />
                ))}
              </div>
            </div>

            {/* Details section */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Detalji</span>
              <div style={{ background: "var(--secondary)", borderRadius: "var(--radius-xl)", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Location */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>Lokacija</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.2 }}>
                      {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Tag size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2 }}>Kategorija</p>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.2 }}>{categoryLabel}</p>
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.2, marginBottom: 4 }}>Opis</p>
                      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--foreground)", lineHeight: 1.5 }}>{description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", padding: "10px 14px" }}>
                <p style={{ fontSize: 13, color: "var(--destructive)" }}>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed bottom actions */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 24px 32px", background: "linear-gradient(to top, var(--background) 60%, transparent)" }} className="flex flex-col gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            style={{
              height: 56,
              borderRadius: "var(--radius-xl)",
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontSize: 16,
              fontWeight: 700,
              boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 25%, transparent)",
              opacity: loading ? 0.7 : 1,
            }}
            className="w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Prijava se šalje...
              </>
            ) : (
              <>
                <Send size={20} />
                Pošalji prijavu
              </>
            )}
          </button>
        </div>
      </div>

      {showDuplicateModal && (
        <DuplicateWarningModal
          onSupport={() => {
            setShowDuplicateModal(false);
            if (duplicateReportId) router.push(`/mapa?report=${duplicateReportId}`);
          }}
          onProceed={() => {
            setShowDuplicateModal(false);
            handleSubmit(true);
          }}
        />
      )}
    </>
  );
}
