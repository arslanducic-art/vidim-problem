// Novo Sarajevo boundary polygon (approximate GeoJSON coordinates)
// Source: OpenStreetMap administrative boundary
const NOVO_SARAJEVO_POLYGON: [number, number][] = [
  [43.8371, 18.3701],
  [43.8371, 18.4501],
  [43.8701, 18.4501],
  [43.8701, 18.3701],
  [43.8371, 18.3701],
];

// Default center: Novo Sarajevo
export const NS_DEFAULT_CENTER = { lat: 43.8563, lng: 18.4131 };

/**
 * Point-in-polygon check using ray casting algorithm.
 */
export function checkInsideNovoSarajevo(lat: number, lng: number): boolean {
  const polygon = NOVO_SARAJEVO_POLYGON;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
