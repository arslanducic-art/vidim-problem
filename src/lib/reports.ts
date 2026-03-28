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
  photoFile: File;
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
export async function checkDuplicate(
  lat: number,
  lng: number,
  category: string
): Promise<Report | null> {
  const center = [lat, lng] as [number, number];
  const radiusM = 50;
  const bounds = geohashQueryBounds(center, radiusM);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  for (const b of bounds) {
    const q = query(
      collection(db, "reports"),
      where("location.geohash", ">=", b[0]),
      where("location.geohash", "<=", b[1]),
      where("category", "==", category),
      where("createdAt", ">=", Timestamp.fromDate(ninetyDaysAgo)),
      where("status", "!=", "riješeno")
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      const data = d.data();
      const dist = distanceBetween(center, [data.location.lat, data.location.lng]) * 1000;
      if (dist <= radiusM) {
        return { id: d.id, ...data } as Report;
      }
    }
  }
  return null;
}

// Upload photo to Firebase Storage
export async function uploadPhoto(file: File, reportId: string): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storageRef = ref(storage, `reports/${reportId}/photo.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
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
  const photoUrl = await uploadPhoto(data.photoFile, reportId);
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
      photoUrl,
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
