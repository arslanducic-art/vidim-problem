import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Run with: node scripts/seed-firestore.mjs
// Requires: GOOGLE_APPLICATION_CREDENTIALS env var OR firebase-admin default credentials

initializeApp({ projectId: "prijavi-problem-sarajevo" });
const db = getFirestore();

const PILOT_EMAIL = "arslanducic@gmail.com";

const categories = [
  { id: "rasvjeta",     label: "Rasvjeta",              icon: "💡", email: PILOT_EMAIL },
  { id: "ceste",        label: "Ceste i trotori",        icon: "🛣️", email: PILOT_EMAIL },
  { id: "otpad",        label: "Otpad i čistoća",        icon: "🗑️", email: PILOT_EMAIL },
  { id: "zelenilo",     label: "Zelenilo i parkovi",     icon: "🌳", email: PILOT_EMAIL },
  { id: "vandalizm",    label: "Vandalizm",              icon: "🚫", email: PILOT_EMAIL },
  { id: "signalizacija",label: "Signalizacija",          icon: "🚦", email: PILOT_EMAIL },
  { id: "vodovod",      label: "Vodovod i kanalizacija", icon: "🔧", email: PILOT_EMAIL },
];

async function seed() {
  // /config/routing — kategorije + email routing
  await db.doc("config/routing").set({ categories });
  console.log("✓ config/routing seeded:", categories.length, "kategorija");

  // /config/counters — ticket ID counter
  await db.doc("config/counters").set({ "NS-2026": 0 }, { merge: true });
  console.log("✓ config/counters seeded: NS-2026 = 0");

  console.log("\nDone! Firebase Firestore je popunjen.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Greška:", err);
  process.exit(1);
});
