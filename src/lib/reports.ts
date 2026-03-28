import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { geohashForLocation, geohashQueryBounds, distanceBetween } from "geofire-common";
import { db, storage } from "./firebase";

export interface Category {
  id: string;
  label: string;
  icon: string;
  email: string;
}

export interface ReportData {
  userId: string;
  category: string;
  categoryLabel: string;
  description: string;
  location: { lat: number; lng: number };
  photoFiles: File[];
}

export interface Report {
  id: string;
  ticketId: string;
  status: string;
  category: string;
  categoryLabel: string;
  location: { lat: number; lng: number };
  createdAt: Timestamp;
}

// Fetch categories from Firestore routing config
export async function fetchCategories(): Promise<Category[]> {
  const snap = await getDoc(doc(db, "config", "routing"));
  if (!snap.exists()) return [];
  return snap.data().categories as Category[];
}

// Check for duplicate: same category, within 50m, last 90 days
// NOTE: Firestore only supports inequality on one field per query.
// We use geohash range only, then filter by date/status/distance client-side.
export async function checkDuplicate(
  lat: number,
  lng: number,
  category: string
): Promise<Report | null> {
  const center = [lat, lng] as [number, number];
  const radiusM = 50;
  const bounds = geohashQueryBounds(center, radiusM);
  const ninetyDaysAgo = Timestamp.fromDate(
    new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  );

  for (const b of bounds) {
    const q = query(
      collection(db, "reports"),
      where("location.geohash", ">=", b[0]),
      where("location.geohash", "<=", b[1]),
      where("category", "==", category)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      // Client-side filters: date + status + distance
      if (data.status === "riješeno") continue;
      if (data.createdAt && data.createdAt < ninetyDaysAgo) continue;
      const dist = distanceBetween(center, [data.location.lat, data.location.lng]) * 1000;
      if (dist <= radiusM) {
        return { id: d.id, ...data } as Report;
      }
    }
  }
  return null;
}

// Upload multiple photos to Firebase Storage sequentially
export async function uploadPhotos(files: File[], reportId: string): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split(".").pop() ?? "jpg";
    const storageRef = ref(storage, `reports/${reportId}/photo_${i}.${ext}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

// Generate ticket ID atomically: #NS-2026-XXXX
export async function generateTicketId(): Promise<string> {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "config", "counters");

  const ticketId = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const key = `NS-${year}`;
    const current = snap.exists() ? (snap.data()[key] ?? 0) : 0;
    const next = current + 1;
    tx.set(counterRef, { [key]: next }, { merge: true });
    return `#NS-${year}-${String(next).padStart(4, "0")}`;
  });

  return ticketId;
}

// Create report document in Firestore
export async function createReport(data: ReportData): Promise<{ id: string; ticketId: string }> {
  const reportId = doc(collection(db, "reports")).id;
  const photoUrls = await uploadPhotos(data.photoFiles, reportId);
  const ticketId = await generateTicketId();
  const geohash = geohashForLocation([data.location.lat, data.location.lng]);

  const reportRef = doc(db, "reports", reportId);
  await runTransaction(db, async (tx) => {
    tx.set(reportRef, {
      userId: data.userId,
      ticketId,
      category: data.category,
      categoryLabel: data.categoryLabel,
      description: data.description || null,
      photoUrls,
      location: {
        lat: data.location.lat,
        lng: data.location.lng,
        geohash,
      },
      status: "zaprimljeno",
      votes: 0,
      municipality: "novo-sarajevo",
      createdAt: serverTimestamp(),
    });
  });

  return { id: reportId, ticketId };
}
