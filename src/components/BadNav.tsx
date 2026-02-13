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

  useEffect(() => {
    // Sometimes reshuffle later to simulate “I swear it moved”.
    if (navConfusion < 8) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.35) {
        setShuffled((prev) => {
          const copy = [...prev];
          copy.reverse();
          return copy;
        });
      }
    }, 4200);
    return () => window.clearInterval(id);
  }, [navConfusion]);

  return (
    <nav className="wwg-card wwg-nav wwg-wobble p-3">
      <div className="wwg-nav-items flex flex-wrap gap-2">
        {shuffled.map((it, idx) => (
          <Link
            key={`${it.href}_${idx}`}
            href={it.href}
            className="wwg-btn inline-block wwg-tip"
            data-tip={`This link goes to: ${it.href}. Unless it doesn’t. (${idx + 1}/${shuffled.length})`}
            prefetch={false}
          >
            {it.label}
          </Link>
        ))}
      </div>
      <p className="mt-2 text-xs italic wwg-flicker">
        Breadcrumb: /you/are/here/except/you/aren’t (refresh for new truth)
      </p>
      <div className="mt-2 wwg-marquee text-xs font-black">
        <span>breaking news: navigation is a mindset • click carefully • click loudly • click quietly •</span>
      </div>
    </nav>
  );
}
