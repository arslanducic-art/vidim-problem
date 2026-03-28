# Vidim Problem — Project Context

Civic tech web platforma za prijavu komunalnih problema u Kantonu Sarajevo. Građani prijavljuju komunalne probleme na interaktivnoj mapi. Prijave dobijaju ticket ID, prate se kroz statusni workflow, i usmjeravaju nadležnim komunalnim službama putem emaila.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Firebase (Auth + Firestore + Storage + Hosting) · Cloud Functions

**Firebase Project:** `prijavi-problem-sarajevo`

**Active codebase:** `~/Documents/vidim-problem/`

---

## Naming Conventions

- Fajlovi: `kebab-case.ts` / `kebab-case.tsx`
- Komponente: `PascalCase`
- Hook fajlovi: `use-name.ts` prefix
- Varijable/funkcije: `camelCase`
- Konstante: `UPPER_SNAKE_CASE`
- Branches: `feature/name`, `fix/name`

## Architecture

```
src/
├── app/              ← Next.js App Router pages
├── components/       ← UI components
├── context/          ← React context (AuthContext)
├── lib/              ← Firebase, auth helpers, utils
└── hooks/            ← Custom hooks
```

## Key Files

- `src/lib/firebase.ts` — Firebase init (auth, db, storage)
- `src/lib/auth.ts` — Auth helper functions
- `src/context/AuthContext.tsx` — Auth state + useAuth hook
- `firestore.rules` — Firestore security rules
- `storage.rules` — Storage security rules
- `.firebaserc` — Firebase project config

## Language

Cijeli UI, poruke, emailovi i sadržaj su isključivo na **bosanskom jeziku**.

## Moderator

`arslanducic@gmail.com` — moderator status dodjeljuje se putem Firebase custom claims (`moderator: true`). Nikad ne koristiti Firestore property za provjeru moderatorskog statusa.
