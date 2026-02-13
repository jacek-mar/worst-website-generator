"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function BadNav({
  items,
  navConfusion,
}: {
  items: Array<{ label: string; href: string }>;
  navConfusion: number;
}) {
  // Randomize order per mount (confusing), but keep render pure.
  const [shuffled, setShuffled] = useState(items);

  useEffect(() => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    // Occasionally duplicate one entry.
    if (navConfusion >= 7 && copy.length > 2) copy.splice(2, 0, copy[0]!);
    setShuffled(copy);
    // Intentionally not stable across prop changes: confusion is a feature.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className="wwg-card wwg-wobble p-3">
      <div className="flex flex-wrap gap-2">
        {shuffled.map((it, idx) => (
          <Link
            key={`${it.href}_${idx}`}
            href={it.href}
            className="wwg-btn inline-block"
            prefetch={false}
          >
            {it.label}
          </Link>
        ))}
      </div>
      <p className="mt-2 text-xs italic">
        Breadcrumb: /you/are/here/except/you/aren’t
      </p>
    </nav>
  );
}
