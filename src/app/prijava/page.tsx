"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { StepFoto } from "@/components/submission/StepFoto";
import { StepLokacija } from "@/components/submission/StepLokacija";
import { StepKategorija } from "@/components/submission/StepKategorija";
import { StepPregled } from "@/components/submission/StepPregled";
import { PotvrdaPrijave } from "@/components/submission/PotvrdaPrijave";
import { fetchCategories, Category } from "@/lib/reports";
import { AlertCircle, Loader2 } from "lucide-react";

// Steps: 1=photos, 2=location, 3=category+desc, 4=review
type Step = 1 | 2 | 3 | 4 | "success";

export default function PrijavaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [category, setCategory] = useState("");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [description, setDescription] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [reportId, setReportId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login?returnUrl=/prijava");
  }, [user, loading, router]);

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

  if (!user.emailVerified) {
    return (
      <div style={{ background: "var(--background)", minHeight: "100svh" }} className="flex flex-col items-center justify-center px-6">
        <div style={{ background: "var(--accent)", borderRadius: "50%", width: 56, height: 56, marginBottom: 16 }} className="flex items-center justify-center">
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
          style={{ marginTop: 24, height: 52, paddingInline: 32, borderRadius: "var(--radius-xl)", background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 15, fontWeight: 700 }}
          className="flex items-center justify-center"
        >
          Idi na verifikaciju
        </button>
      </div>
    );
  }

  if (step === "success") {
    return <PotvrdaPrijave ticketId={ticketId} reportId={reportId} />;
  }

  if (step === 1) {
    return (
      <StepFoto
        photos={photos}
        onPhotosChange={setPhotos}
        onNext={() => setStep(2)}
        onBack={() => router.push("/mapa")}
        onCancel={() => router.push("/mapa")}
      />
    );
  }

  if (step === 2) {
    return (
      <StepLokacija
        location={location}
        onLocationChange={setLocation}
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
        onCancel={() => router.push("/mapa")}
      />
    );
  }

  if (step === 3) {
    return (
      <StepKategorija
        category={category}
        description={description}
        onCategoryChange={(id) => {
          setCategory(id);
          const cat = categories.find((c) => c.id === id);
          setCategoryLabel(cat?.label ?? id);
        }}
        onDescriptionChange={setDescription}
        onNext={() => setStep(4)}
        onBack={() => setStep(2)}
        onCancel={() => router.push("/mapa")}
      />
    );
  }

  if (step === 4 && photos.length > 0 && location) {
    return (
      <StepPregled
        photos={photos}
        location={location}
        category={category}
        categoryLabel={categoryLabel}
        description={description}
        onBack={() => setStep(3)}
        onSuccess={(tid, rid) => {
          setTicketId(tid);
          setReportId(rid);
          setStep("success");
        }}
      />
    );
  }

  return null;
}
