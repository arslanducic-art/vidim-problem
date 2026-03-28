"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { fetchCategories, Category } from "@/lib/reports";

const CATEGORY_ICONS: Record<string, string> = {
  rasvjeta: "💡",
  ceste: "🛣️",
  otpad: "🗑️",
  zelenilo: "🌳",
  vandalizm: "🚫",
  signalizacija: "🚦",
  vodovod: "🔧",
};

interface Props {
  category: string;
  description: string;
  onCategoryChange: (cat: string) => void;
  onDescriptionChange: (desc: string) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepKategorija({ category, description, onCategoryChange, onDescriptionChange, onNext, onBack, onCancel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [catError, setCatError] = useState("");
  const [errors, setErrors] = useState<{ category?: string }>({});

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCatError("Kategorije nisu dostupne. Osvježi stranicu."));
  }, []);

  function handleNext() {
    if (!category) { setErrors({ category: "Odaberi kategoriju problema." }); return; }
    onNext();
  }

  const descCount = description.length;

  return (
    <div style={{ background: "var(--background)", minHeight: "100svh", display: "flex", flexDirection: "column" }}>

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button
          onClick={onBack}
          style={{ background: "var(--secondary)", borderRadius: 22, width: 44, height: 44 }}
          className="flex items-center justify-center"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={onCancel}
          style={{ fontSize: 15, fontWeight: 600, color: "var(--muted-foreground)" }}
        >
          Odustani
        </button>
      </div>

      {/* Progress: step 2 of 3 (same segment as location) */}
      <div className="flex gap-1.5 px-6 mb-2 flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < 2 ? "var(--primary)" : "var(--secondary)" }} />
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header */}
        <div style={{ padding: "24px 24px 32px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 12 }}>
            Kategorija i opis
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
            Odaberi vrstu problema i dodaj kratki opis.
          </p>
        </div>

        <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Categories */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
              Vrsta problema
            </p>
            {catError ? (
              <p style={{ fontSize: 14, color: "var(--destructive)" }}>{catError}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categories.map((cat) => {
                  const selected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { onCategoryChange(cat.id); setErrors({}); }}
                      style={{
                        background: selected ? "color-mix(in srgb, var(--primary) 10%, var(--secondary))" : "var(--secondary)",
                        borderRadius: "var(--radius-xl)", height: 56,
                        border: selected ? "2px solid var(--primary)" : "2px solid transparent",
                        transition: "all 0.15s",
                        display: "flex", alignItems: "center", padding: "0 16px", gap: 12, width: "100%",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[cat.id] ?? "📍"}</span>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>{cat.label}</span>
                      {selected && (
                        <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {errors.category && (
              <p style={{ fontSize: 13, color: "var(--destructive)", marginTop: 8 }}>{errors.category}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
              Opis <span style={{ fontWeight: 500, color: "var(--muted-foreground)" }}>(opciono)</span>
            </p>
            <div style={{ position: "relative" }}>
              <textarea
                value={description}
                onChange={(e) => { if (e.target.value.length <= 500) onDescriptionChange(e.target.value); }}
                placeholder="Kratki opis problema..."
                maxLength={500}
                rows={4}
                style={{
                  width: "100%", background: "var(--secondary)", borderRadius: "var(--radius-xl)",
                  padding: "14px 16px", fontSize: 15, fontWeight: 500,
                  color: "var(--foreground)", outline: "none", resize: "none", border: "1px solid transparent",
                }}
                className="placeholder:text-[var(--muted-foreground)]"
              />
              <p style={{ position: "absolute", bottom: 10, right: 14, fontSize: 12, fontWeight: 600, color: descCount >= 450 ? "var(--destructive)" : "var(--muted-foreground)" }}>
                {descCount}/500
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "24px 24px 32px", background: "linear-gradient(to top, var(--background) 60%, transparent)" }}>
        <button
          onClick={handleNext}
          style={{
            width: "100%", height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
            boxShadow: "0 8px 24px rgba(249,115,22,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          Nastavi na pregled
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
