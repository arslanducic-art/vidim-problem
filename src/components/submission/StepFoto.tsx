"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

interface Props {
  photo: File | null;
  onPhotoChange: (file: File | null) => void;
  onNext: () => void;
}

export function StepFoto({ photo, onPhotoChange, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(
    photo ? URL.createObjectURL(photo) : null
  );

  function handleFile(file: File) {
    setError("");
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Podržani formati su JPG, PNG i WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fotografija ne smije biti veća od ${MAX_SIZE_MB}MB.`);
      return;
    }
    setPreview(URL.createObjectURL(file));
    onPhotoChange(file);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleNext() {
    if (!photo) {
      setError("Dodaj fotografiju problema prije nastavka.");
      return;
    }
    onNext();
  }

  return (
    <div className="flex flex-col flex-1 px-6 pb-8">
      <div className="flex flex-col gap-3 mt-6 mb-8">
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--foreground)" }}>
          Fotografija
        </h2>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)" }}>
          Sfotografiši ili odaberi fotografiju problema.
        </p>
      </div>

      {/* Upload area */}
      {preview ? (
        <div className="relative mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full object-cover"
            style={{ borderRadius: "var(--radius-xl)", maxHeight: 280 }}
          />
          <button
            onClick={() => { onPhotoChange(null); setPreview(null); setError(""); }}
            style={{
              position: "absolute", top: 10, right: 10,
              background: "rgba(0,0,0,0.55)", borderRadius: "50%",
              width: 32, height: 32,
            }}
            className="flex items-center justify-center"
          >
            <X size={18} color="white" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            background: "var(--secondary)",
            borderRadius: "var(--radius-xl)",
            border: `2px dashed ${error ? "var(--destructive)" : "var(--border)"}`,
            minHeight: 200,
          }}
          className="flex flex-col items-center justify-center gap-3 mb-6 cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <div
            style={{ background: "var(--muted)", borderRadius: "50%", width: 56, height: 56 }}
            className="flex items-center justify-center"
          >
            <ImagePlus size={24} color="var(--muted-foreground)" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
            Prevuci fotografiju ovdje
          </p>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>ili klikni za odabir</p>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)" }}>JPG, PNG, WEBP · max 10MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleInput}
      />

      {error && (
        <p style={{ fontSize: 13, color: "var(--destructive)", marginBottom: 12 }}>{error}</p>
      )}

      {/* Buttons */}
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => inputRef.current?.setAttribute("capture", "environment") || inputRef.current?.click()}
          style={{
            flex: 1, height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--secondary)", color: "var(--foreground)",
            fontSize: 15, fontWeight: 700,
          }}
          className="flex items-center justify-center gap-2"
        >
          <Camera size={20} />
          Slikaj
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 2, height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
            opacity: photo ? 1 : 0.6,
          }}
          className="flex items-center justify-center"
        >
          Nastavi
        </button>
      </div>
    </div>
  );
}
