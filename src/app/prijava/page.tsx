"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProgressIndicator } from "@/components/submission/ProgressIndicator";
import { StepFoto } from "@/components/submission/StepFoto";
import { StepLokacijaKategorija } from "@/components/submission/StepLokacijaKategorija";
import { StepPregled } from "@/components/submission/StepPregled";
import { PotvrdaPrijave } from "@/components/submission/PotvrdaPrijave";
import { fetchCategories, Category } from "@/lib/reports";
import { AlertCircle, Loader2 } from "lucide-react";

type Step = 1 | 2 | 3 | "success";

export default function PrijavaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [description, setDescription] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [reportId, setReportId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?returnUrl=/prijava");
    }
  }, [user, loading, router]);

  // Preload categories
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  if (loading) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex items-center justify-center">
        <Loader2 size={28} color="var(--primary)" className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // Unverified email block
  if (!user.emailVerified) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col items-center justify-center px-6">
        <div
          style={{ background: "var(--accent)", borderRadius: "50%", width: 56, height: 56, marginBottom: 16 }}
          className="flex items-center justify-center"
        >
          <AlertCircle size={28} color="var(--accent-foreground)" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--foreground)", textAlign: "center", marginBottom: 8 }}>
          Potvrdi email adresu
        </h2>
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.5 }}>
          Potvrdi email adresu prije prijave problema.
        </p>
        <button
          onClick={() => router.push("/email-verifikacija")}
          style={{
            marginTop: 24, height: 52, paddingInline: 32,
            borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 15, fontWeight: 700,
          }}
          className="flex items-center justify-center"
        >
          Idi na verifikaciju
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col">
        <PotvrdaPrijave ticketId={ticketId} reportId={reportId} />
      </div>
    );
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col">
      {/* Top nav */}
      <div className="flex items-center px-6 py-4 flex-shrink-0">
        <button
          onClick={() => step === 1 ? router.push("/mapa") : setStep((s) => (s as number) - 1 as Step)}
          style={{ background: "var(--secondary)", borderRadius: "22px" }}
          className="w-11 h-11 flex items-center justify-center"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <ProgressIndicator current={step as number} />

      {step === 1 && (
        <StepFoto
          photo={photo}
          onPhotoChange={setPhoto}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepLokacijaKategorija
          location={location}
          category={category}
          description={description}
          onLocationChange={setLocation}
          onCategoryChange={(id) => {
            setCategory(id);
            const cat = categories.find((c) => c.id === id);
            setCategoryLabel(cat?.label ?? id);
          }}
          onDescriptionChange={setDescription}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && photo && location && (
        <StepPregled
          photo={photo}
          location={location}
          category={category}
          categoryLabel={categoryLabel}
          description={description}
          onBack={() => setStep(2)}
          onSuccess={(tid, rid) => {
            setTicketId(tid);
            setReportId(rid);
            setStep("success");
          }}
        />
      )}
    </div>
  );
}
