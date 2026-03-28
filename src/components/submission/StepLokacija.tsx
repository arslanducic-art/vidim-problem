"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Navigation, Search, XCircle, AlertCircle } from "lucide-react";
import { NS_DEFAULT_CENTER, checkInsideNovoSarajevo } from "@/lib/geofence";

// Load Google Maps script once, reuse across navigations
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
  onLocationChange: (loc: { lat: number; lng: number }) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
}

export function StepLokacija({ location, onLocationChange, onNext, onBack, onCancel }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const [outsideNS, setOutsideNS] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Load Maps script
  useEffect(() => {
    if (window.google?.maps?.places) { setMapsReady(true); return; }
    loadGoogleMaps().then(() => setMapsReady(true)).catch(() => setMapsError(true));
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;

    const map = new google.maps.Map(mapDivRef.current, {
      center: location ?? NS_DEFAULT_CENTER,
      zoom: 16,
      disableDefaultUI: true,
      streetViewControl: true,
      streetViewControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
      gestureHandling: "greedy",
      clickableIcons: false,
    });
    mapRef.current = map;

    // Geofence check on idle
    map.addListener("idle", () => {
      const c = map.getCenter();
      if (!c) return;
      const inside = checkInsideNovoSarajevo(c.lat(), c.lng());
      setOutsideNS(!inside);
      setLocationError(inside ? "" : "U pilot fazi platforma je dostupna samo za područje Općine Novo Sarajevo.");
    });

    // Places autocomplete
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
          setSearchValue(place.formatted_address ?? place.name ?? "");
        }
      });
    }
  }, [mapsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleMyLocation() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.setCenter(loc);
        mapRef.current?.setZoom(17);
      },
      () => {}
    );
  }

  function handleNext() {
    const c = mapRef.current?.getCenter();
    if (!c) { setLocationError("Mapa nije učitana."); return; }
    const pos = { lat: c.lat(), lng: c.lng() };
    if (!checkInsideNovoSarajevo(pos.lat, pos.lng)) {
      setLocationError("Postavi pin unutar Općine Novo Sarajevo.");
      return;
    }
    onLocationChange(pos);
    onNext();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--background)", display: "flex", flexDirection: "column" }}>

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

      {/* Progress: step 2 of 3 */}
      <div className="flex gap-1.5 px-6 mb-2 flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < 2 ? "var(--primary)" : "var(--secondary)" }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ padding: "24px 24px 16px", flexShrink: 0 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.8px", lineHeight: 1.15, margin: "0 0 12px 0" }}>
          Lokacija problema
        </h1>
        <p style={{ fontSize: 16, fontWeight: 500, color: "var(--muted-foreground)", lineHeight: 1.5, margin: 0 }}>
          Označi na karti gdje se problem nalazi ili upiši tačnu adresu.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ padding: "0 24px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: 16 }}>
          <Search size={20} color="var(--muted-foreground)" style={{ flexShrink: 0 }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={mapsReady ? "Upiši adresu..." : "Učitavam mapu..."}
            disabled={!mapsReady}
            style={{ flex: 1, fontSize: 16, fontWeight: 500, background: "transparent", outline: "none", border: "none", color: "var(--foreground)", minWidth: 0 }}
            className="placeholder:text-[var(--muted-foreground)]"
          />
          {searchValue && (
            <button onClick={() => { setSearchValue(""); searchInputRef.current?.focus(); }}>
              <XCircle size={20} color="var(--muted-foreground)" />
            </button>
          )}
        </div>
      </div>

      {/* Map area — fills remaining space */}
      <div style={{ flex: 1, position: "relative", borderRadius: "24px 24px 0 0", overflow: "hidden", background: "var(--secondary)" }}>
        {/* Top gradient overlay */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40, background: "linear-gradient(to bottom, rgba(244,239,233,0.2), transparent)", zIndex: 2, pointerEvents: "none" }} />

        {/* Map */}
        {mapsError && (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Mapa nije dostupna.</p>
          </div>
        )}
        {!mapsReady && !mapsError && (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>Učitavam mapu...</p>
          </div>
        )}
        <div ref={mapDivRef} style={{ width: "100%", height: "100%", display: mapsReady ? "block" : "none" }} />

        {/* Center pin */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)", marginTop: -2, zIndex: 10, pointerEvents: "none", filter: "drop-shadow(0 8px 12px rgba(249,115,22,0.4))" }}>
          <MapPin size={48} color="var(--primary)" />
        </div>
        {/* Pin shadow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 20, height: 6, background: "rgba(0,0,0,0.25)", borderRadius: "50%", filter: "blur(2px)", zIndex: 9, pointerEvents: "none" }} />

        {/* My location button */}
        <button
          onClick={handleMyLocation}
          style={{ position: "absolute", bottom: 120, right: 24, width: 48, height: 48, borderRadius: 24, background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", border: "1px solid var(--border)", zIndex: 10 }}
        >
          <Navigation size={20} />
        </button>

        {/* Outside NS error */}
        {locationError && (
          <div style={{ position: "absolute", top: 16, left: 16, right: 16, zIndex: 20, background: "rgba(254,242,242,0.95)", border: "1px solid #fca5a5", borderRadius: "var(--radius-lg)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-start", backdropFilter: "blur(8px)" }}>
            <AlertCircle size={16} color="var(--destructive)" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "var(--destructive)", margin: 0 }}>{locationError}</p>
          </div>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 24px 32px", background: "linear-gradient(to top, var(--background) 70%, transparent)", pointerEvents: "none", zIndex: 20 }}>
        <button
          onClick={handleNext}
          style={{ pointerEvents: "auto", width: "100%", height: 56, borderRadius: "var(--radius-xl)", background: "var(--primary)", color: "var(--primary-foreground)", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, boxShadow: "0 8px 24px rgba(249,115,22,0.25)" }}
        >
          <span>Nastavi na detalje</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
