"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Search, AlertCircle, ArrowRight } from "lucide-react";
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

// Load the Google Maps script once, reuse if already present
let scriptLoadPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps?.places) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => { scriptLoadPromise = null; reject(new Error("Maps load failed")); };
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

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
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const [outsideNS, setOutsideNS] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catError, setCatError] = useState("");
  const [errors, setErrors] = useState<{ location?: string; category?: string }>({});

  // Load script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setMapsReady(true);
      return;
    }
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true));
  }, []);

  // Initialize map after script loaded
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;

    const initialCenter = location ?? NS_DEFAULT_CENTER;

    const map = new google.maps.Map(mapDivRef.current, {
      center: initialCenter,
      zoom: 16,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      clickableIcons: false,
    });
    mapRef.current = map;

    // Geofence check when map stops moving
    map.addListener("idle", () => {
      const c = map.getCenter();
      if (!c) return;
      const inside = checkInsideNovoSarajevo(c.lat(), c.lng());
      setOutsideNS(!inside);
      setErrors((prev) => ({
        ...prev,
        location: inside ? undefined : "U pilot fazi platforma je dostupna samo za područje Općine Novo Sarajevo.",
      }));
    });

    // Address search autocomplete
    if (searchInputRef.current) {
      const sarajevoBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(43.82, 18.33),
        new google.maps.LatLng(43.90, 18.50)
      );
      const ac = new google.maps.places.Autocomplete(searchInputRef.current, {
        componentRestrictions: { country: "ba" },
        bounds: sarajevoBounds,
        strictBounds: false,
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place?.geometry?.location) {
          map.panTo(place.geometry.location);
          map.setZoom(17);
        }
      });
    }

  }, [mapsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch categories
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCatError("Kategorije nisu dostupne. Osvježi stranicu."));
  }, []);

  function handleNext() {
    const c = mapRef.current?.getCenter();
    if (!c) {
      setErrors({ location: "Mapa nije učitana." });
      return;
    }
    const pos = { lat: c.lat(), lng: c.lng() };
    const inside = checkInsideNovoSarajevo(pos.lat, pos.lng);
    const e: { location?: string; category?: string } = {};
    if (!inside) e.location = "Postavi pin unutar Općine Novo Sarajevo.";
    if (!category) e.category = "Odaberi kategoriju problema.";
    if (Object.keys(e).length) { setErrors(e); return; }
    onLocationChange(pos);
    onNext();
  }

  const descCount = description.length;
  const descNearLimit = descCount >= 450;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--background)" }}>
      {/* Full-screen map */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {mapsError ? (
          <div style={{ background: "var(--muted)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Mapa nije dostupna.</p>
          </div>
        ) : !mapsReady ? (
          <div style={{ background: "var(--muted)", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Učitavam mapu...</p>
          </div>
        ) : null}
        {/* Map div always in DOM so ref is available */}
        <div
          ref={mapDivRef}
          style={{ width: "100%", height: "100%", display: mapsReady ? "block" : "none" }}
        />
      </div>

      {/* Center pin */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -100%)",
          zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center",
          marginTop: "-60px", pointerEvents: "none",
        }}
      >
        <div style={{
          width: 48, height: 48, background: "var(--primary)",
          borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        }}>
          <MapPin size={22} color="white" style={{ transform: "rotate(45deg)" }} />
        </div>
        <div style={{ width: 16, height: 4, background: "rgba(0,0,0,0.3)", borderRadius: "50%", marginTop: 8, filter: "blur(2px)" }} />
      </div>

      {/* Top overlay */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        padding: "16px 24px", display: "flex", gap: 12, alignItems: "flex-start",
        background: "linear-gradient(to bottom, rgba(244,239,233,0.9) 0%, transparent 100%)",
      }}>
        <button
          onClick={onBack}
          style={{
            width: 48, height: 48, borderRadius: 24,
            background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{
          flex: 1, height: 48, background: "var(--background)", borderRadius: 24,
          display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <Search size={18} color="var(--muted-foreground)" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={mapsReady ? "Pretražite adresu..." : "Učitavam mapu..."}
            disabled={!mapsReady}
            style={{
              flex: 1, fontSize: 15, fontWeight: 500,
              color: "var(--foreground)", background: "transparent",
              outline: "none", border: "none", width: "100%",
            }}
            className="placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: "var(--background)", borderRadius: "32px 32px 0 0",
        padding: "20px 24px 32px",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.08)",
        maxHeight: "62svh", overflowY: "auto", overscrollBehavior: "contain",
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {/* Handle */}
        <div style={{ width: 40, height: 5, background: "var(--border)", borderRadius: 3, margin: "0 auto -8px" }} />

        {/* Location indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MapPin size={22} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.4px", marginBottom: 2 }}>
              Označi lokaciju
            </p>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontWeight: 500 }}>
              Pomakni mapu da centriraš pin na problem
            </p>
          </div>
        </div>

        {/* Outside NS error */}
        {errors.location && (
          <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start" }}>
            <AlertCircle size={16} color="var(--destructive)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "var(--destructive)" }}>{errors.location}</p>
          </div>
        )}

        {/* Categories */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 10 }}>Kategorija problema</p>
          {catError ? (
            <p style={{ fontSize: 14, color: "var(--destructive)" }}>{catError}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {categories.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { onCategoryChange(cat.id); setErrors((p) => ({ ...p, category: undefined })); }}
                    style={{
                      background: selected ? "color-mix(in srgb, var(--primary) 10%, var(--secondary))" : "var(--secondary)",
                      borderRadius: "var(--radius-xl)", height: 52,
                      border: selected ? "2px solid var(--primary)" : "2px solid transparent",
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", padding: "0 16px", gap: 12, width: "100%",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[cat.id] ?? "📍"}</span>
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
            <p style={{ fontSize: 13, color: "var(--destructive)", marginTop: 6 }}>{errors.category}</p>
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
              rows={3}
              style={{
                width: "100%", background: "var(--secondary)", borderRadius: "var(--radius-xl)",
                padding: "14px 16px", fontSize: 15, fontWeight: 500,
                color: "var(--foreground)", outline: "none", resize: "none", border: "1px solid transparent",
              }}
              className="placeholder:text-[var(--muted-foreground)]"
            />
            <p style={{ position: "absolute", bottom: 10, right: 14, fontSize: 12, fontWeight: 600, color: descNearLimit ? "var(--destructive)" : "var(--muted-foreground)" }}>
              {descCount}/500
            </p>
          </div>
        </div>

        {/* CTA */}
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
