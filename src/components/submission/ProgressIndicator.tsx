"use client";

interface Props {
  current: number; // 1, 2, or 3
  total?: number;
}

const LABELS = ["Fotografija", "Lokacija", "Pregled"];

export function ProgressIndicator({ current, total = 3 }: Props) {
  return (
    <div className="px-6 pt-2 pb-4">
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < current ? "var(--primary)" : "var(--muted)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 600 }}>
        Korak {current} od {total} — {LABELS[current - 1]}
      </p>
    </div>
  );
}
