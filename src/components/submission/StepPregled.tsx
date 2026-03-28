"use client";

import { useState } from "react";
import { MapPin, Tag, FileText, Loader2 } from "lucide-react";
import { checkDuplicate, createReport } from "@/lib/reports";
import { useAuth } from "@/context/AuthContext";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import { useRouter } from "next/navigation";

interface Props {
  photo: File;
  location: { lat: number; lng: number };
  category: string;
  categoryLabel: string;
  description: string;
  onBack: () => void;
  onSuccess: (ticketId: string, reportId: string) => void;
}

export function StepPregled({
  photo,
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
  const photoUrl = URL.createObjectURL(photo);

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
        photoFile: photo,
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
      <div className="flex flex-col flex-1 px-6 pb-8">
        <div className="flex flex-col gap-3 mt-6 mb-8">
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--foreground)" }}>
            Pregled prijave
          </h2>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)" }}>
            Provjeri detalje prije slanja.
          </p>
        </div>

        {/* Photo thumb */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt="Fotografija problema"
          className="w-full object-cover mb-4"
          style={{ borderRadius: "var(--radius-xl)", height: 180 }}
        />

        {/* Details */}
        <div style={{ background: "var(--secondary)", borderRadius: "var(--radius-xl)" }} className="p-4 flex flex-col gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div style={{ background: "var(--muted)", borderRadius: 8, width: 36, height: 36 }} className="flex items-center justify-center flex-shrink-0">
              <MapPin size={18} color="var(--muted-foreground)" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 2 }}>LOKACIJA</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
                {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div style={{ background: "var(--muted)", borderRadius: 8, width: 36, height: 36 }} className="flex items-center justify-center flex-shrink-0">
              <Tag size={18} color="var(--muted-foreground)" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 2 }}>KATEGORIJA</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>{categoryLabel}</p>
            </div>
          </div>

          {description && (
            <div className="flex items-start gap-3">
              <div style={{ background: "var(--muted)", borderRadius: 8, width: 36, height: 36 }} className="flex items-center justify-center flex-shrink-0">
                <FileText size={18} color="var(--muted-foreground)" />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--muted-foreground)", marginBottom: 2 }}>OPIS</p>
                <p style={{ fontSize: 14, color: "var(--foreground)", lineHeight: 1.5 }}>{description}</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)" }}
            className="p-3 mb-4">
            <p style={{ fontSize: 13, color: "var(--destructive)" }}>{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-auto">
          <button
            onClick={onBack}
            disabled={loading}
            style={{
              flex: 1, height: 56, borderRadius: "var(--radius-xl)",
              background: "var(--secondary)", color: "var(--foreground)",
              fontSize: 16, fontWeight: 700,
            }}
            className="flex items-center justify-center disabled:opacity-50"
          >
            Nazad
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            style={{
              flex: 2, height: 56, borderRadius: "var(--radius-xl)",
              background: "var(--primary)", color: "var(--primary-foreground)",
              fontSize: 16, fontWeight: 700,
            }}
            className="flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Prijava se šalje...
              </>
            ) : "Pošalji prijavu"}
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
