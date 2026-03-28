"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MapPin, AlertCircle } from "lucide-react";
import { NS_DEFAULT_CENTER, checkInsideNovoSarajevo } from "@/lib/geofence";
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
  location: { lat: number; lng: number } | null;
  category: string;
  description: string;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
  onCategoryChange: (cat: string) => void;
  onDescriptionChange: (desc: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepLokacijaKategorija({
  location,
  category,
  description,
  onLocationChange,
  onCategoryChange,
  onDescriptionChange,
  onNext,
  onBack,
}: Props) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [center, setCenter] = useState(location ?? NS_DEFAULT_CENTER);
  const [pinPos, setPinPos] = useState(location ?? NS_DEFAULT_CENTER);
  const [outsideNS, setOutsideNS] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catError, setCatError] = useState("");
  const [errors, setErrors] = useState<{ location?: string; category?: string }>({});
  const mapRef = useRef<google.maps.Map | null>(null);

  // Try to get user's geolocation
  useEffect(() => {
    if (!location) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(loc);
          setPinPos(loc);
          onLocationChange(loc);
        },
        () => {
          // Denied — use NS default
          onLocationChange(NS_DEFAULT_CENTER);
        }
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCatError("Kategorije nisu dostupne. Osvježi stranicu."));
  }, []);

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const pos = { lat, lng };
    setPinPos(pos);
    onLocationChange(pos);
    const inside = checkInsideNovoSarajevo(lat, lng);
    setOutsideNS(!inside);
    setErrors((prev) => ({ ...prev, location: inside ? undefined : "U pilot fazi platforma je dostupna samo za područje Općine Novo Sarajevo." }));
  }

  function handleNext() {
    const e: typeof errors = {};
    if (outsideNS || !location) e.location = "Postavi pin unutar Općine Novo Sarajevo.";
    if (!category) e.category = "Odaberi kategoriju problema.";
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  }

  const descCount = description.length;
  const descNearLimit = descCount >= 450;

  return (
    <div className="flex flex-col flex-1 px-6 pb-8 overflow-y-auto">
      <div className="flex flex-col gap-3 mt-6 mb-6">
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "var(--foreground)" }}>
          Lokacija i kategorija
        </h2>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)" }}>
          Označi tačnu lokaciju i odaberi vrstu problema.
        </p>
      </div>

      {/* Map */}
      <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: 8, height: 220 }}>
        {loadError ? (
          <div
            style={{ background: "var(--secondary)", height: "100%" }}
            className="flex flex-col items-center justify-center gap-2"
          >
            <AlertCircle size={24} color="var(--muted-foreground)" />
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", textAlign: "center" }}>
              Mapa trenutno nije dostupna. Pokušaj ponovo za nekoliko minuta.
            </p>
          </div>
        ) : isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={15}
            onClick={handleMapClick}
            onLoad={(map) => { mapRef.current = map; }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickableIcons: false,
            }}
          >
            <Marker
              position={pinPos}
              draggable
              onDragEnd={(e) => {
                if (!e.latLng) return;
                const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                setPinPos(pos);
                onLocationChange(pos);
                const inside = checkInsideNovoSarajevo(pos.lat, pos.lng);
                setOutsideNS(!inside);
                setErrors((prev) => ({
                  ...prev,
                  location: inside ? undefined : "U pilot fazi platforma je dostupna samo za područje Općine Novo Sarajevo.",
                }));
              }}
            />
          </GoogleMap>
        ) : (
          <div style={{ background: "var(--muted)", height: "100%" }} className="flex items-center justify-center">
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Učitavam mapu...</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        <MapPin size={14} color="var(--muted-foreground)" />
        <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Klikni ili prevuci pin na tačnu lokaciju problema
        </p>
      </div>

      {errors.location && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)" }}
          className="p-3 mb-4 flex gap-2 items-start">
          <AlertCircle size={16} color="var(--destructive)" className="flex-shrink-0 mt-0.5" />
          <p style={{ fontSize: 13, color: "var(--destructive)" }}>{errors.location}</p>
        </div>
      )}

      {/* Categories */}
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 12 }}>
        Kategorija problema
      </p>

      {catError ? (
        <p style={{ fontSize: 14, color: "var(--destructive)", marginBottom: 12 }}>{catError}</p>
      ) : (
        <div className="flex flex-col gap-2 mb-2">
          {categories.map((cat) => {
            const selected = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { onCategoryChange(cat.id); setErrors((p) => ({ ...p, category: undefined })); }}
                style={{
                  background: selected ? "var(--accent)" : "var(--secondary)",
                  borderRadius: "var(--radius-xl)",
                  height: 52,
                  border: selected ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
                className="flex items-center px-4 gap-3 w-full"
              >
                <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat.id] ?? "📍"}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)" }}>
                  {cat.label}
                </span>
                {selected && (
                  <div
                    style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "var(--primary)" }}
                    className="flex items-center justify-center"
                  >
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
        <p style={{ fontSize: 13, color: "var(--destructive)", marginBottom: 8 }}>{errors.category}</p>
      )}

      {/* Description */}
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginTop: 16, marginBottom: 8 }}>
        Opis <span style={{ fontWeight: 500, color: "var(--muted-foreground)" }}>(opciono)</span>
      </p>
      <div style={{ position: "relative" }}>
        <textarea
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= 500) onDescriptionChange(e.target.value);
          }}
          placeholder="Kratki opis problema..."
          maxLength={500}
          rows={3}
          style={{
            width: "100%", background: "var(--secondary)", borderRadius: "var(--radius-xl)",
            padding: "14px 16px", fontSize: 15, fontWeight: 500,
            color: "var(--foreground)", outline: "none", resize: "none",
            border: "1px solid transparent",
          }}
          className="placeholder:text-[var(--muted-foreground)]"
        />
        <p
          style={{
            position: "absolute", bottom: 10, right: 14,
            fontSize: 12, fontWeight: 600,
            color: descNearLimit ? "var(--destructive)" : "var(--muted-foreground)",
          }}
        >
          {descCount}/500
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          style={{
            flex: 1, height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--secondary)", color: "var(--foreground)",
            fontSize: 16, fontWeight: 700,
          }}
          className="flex items-center justify-center"
        >
          Nazad
        </button>
        <button
          onClick={handleNext}
          style={{
            flex: 2, height: 56, borderRadius: "var(--radius-xl)",
            background: "var(--primary)", color: "var(--primary-foreground)",
            fontSize: 16, fontWeight: 700,
          }}
          className="flex items-center justify-center"
        >
          Nastavi
        </button>
      </div>
    </div>
  );
}
