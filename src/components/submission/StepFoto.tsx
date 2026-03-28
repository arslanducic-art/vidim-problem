"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Camera, ArrowRight, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;
const MAX_PHOTOS = 6;

interface Props {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  onNext: () => void;
  onCancel: () => void;
  onBack: () => void;
}

export function StepFoto({ photos, onPhotosChange, onNext, onCancel, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function handleFiles(files: File[]) {
    setError("");
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setError(`Maksimalan broj fotografija je ${MAX_PHOTOS}.`);
      return;
    }
    const toAdd: File[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Podržani formati su JPG, PNG i WEBP.");
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Fotografija ne smije biti veća od ${MAX_SIZE_MB}MB.`);
        continue;
      }
      toAdd.push(file);
    }
    if (toAdd.length > 0) {
      onPhotosChange([...photos, ...toAdd]);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length) handleFiles(files);
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
    setError("");
  }

  function handleNext() {
    if (photos.length === 0) { setError("Dodaj fotografiju problema prije nastavka."); return; }
    onNext();
  }

  return (
    <div style={{ background: "var(--background)", minHeight: "100svh", position: "relative" }} className="flex flex-col">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button
          onClick={onBack}
          style={{ background: "var(--secondary)", borderRadius: "22px", width: 44, height: 44 }}
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

      {/* Progress segments */}
      <div className="flex gap-1.5 px-6 mb-2">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i === 0 ? "var(--primary)" : "var(--secondary)" }} />
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="px-6 pt-6 pb-8">
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 12 }}>
            Fotografije problema
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            Dodaj barem jednu jasnu sliku. Lokaciju i detalje unijet ćeš poslije.
          </p>
        </div>

        <div className="flex items-center justify-between px-6 mb-4">
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}>Dodane fotografije</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--muted-foreground)", background: "var(--secondary)", padding: "6px 12px", borderRadius: 14 }}>
            {photos.length} / {MAX_PHOTOS}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "0 24px" }}>
          {/* Existing photos */}
          {photos.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div key={index} style={{ aspectRatio: "3/4", borderRadius: "var(--radius-xl)", position: "relative", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt={`Preview ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button
                  onClick={() => removePhoto(index)}
                  style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 16, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                  className="flex items-center justify-center"
                >
                  <X size={18} color="white" />
                </button>
                <div style={{ position: "absolute", bottom: 10, left: 10, width: 28, height: 28, borderRadius: 14, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 13, fontWeight: 700, color: "white" }} className="flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
            );
          })}

          {/* Add card — shown as long as under the limit */}
          {photos.length < MAX_PHOTOS && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              style={{
                aspectRatio: "3/4",
                borderRadius: "var(--radius-xl)",
                border: `2px dashed color-mix(in srgb, var(--primary) 30%, var(--border))`,
                background: "color-mix(in srgb, var(--primary) 3%, transparent)",
                cursor: "pointer",
              }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div style={{ width: 56, height: 56, borderRadius: 28, background: "color-mix(in srgb, var(--primary) 12%, transparent)" }} className="flex items-center justify-center">
                <Camera size={28} color="var(--primary)" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--primary)", textAlign: "center", lineHeight: 1.4 }}>
                Dodaj<br />fotografiju
              </span>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--destructive)", padding: "12px 24px 0" }}>{error}</p>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple className="hidden" onChange={handleInput} />

      {/* Fixed bottom action */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 24px 32px", background: "linear-gradient(to top, var(--background) 60%, transparent)" }}>
        <button
          onClick={handleNext}
          style={{
            width: "100%", height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
            boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 25%, transparent)",
            opacity: photos.length >= 1 ? 1 : 0.6,
          }}
          className="flex items-center justify-center gap-3"
        >
          <span>Nastavi na detalje</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
