"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChaosSettings, IconTheme, LandingPageType } from "@/lib/chaos";
import {
  LANDING_PAGE_TYPE_OPTIONS,
  normalizeLandingPageType,
  normalizeSettings,
  paletteFromSeed,
} from "@/lib/chaos";
import { BadIconStrip } from "@/components/BadIconStrip";

const DEFAULTS: ChaosSettings = {
  visualPain: 7,
  navConfusion: 6,
  performanceNightmare: 6,
  cognitiveOverload: 8,
  aiAbsurdity: 9,
  totalChaos: 7,
};

function Slider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="wwg-card p-3 wwg-tip" data-tip="This slider is both real and symbolic. Move it anyway.">
      <div className="flex items-center justify-between gap-2">
        <div className="font-black">{label}</div>
        <div className="text-xs">{value}/10</div>
      </div>
      <input
        className="mt-2 w-full wwg-tilt"
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="mt-1 text-xs italic">This slider is accurate-ish.</div>
    </div>
  );
}

export function ChaosControls() {
  const router = useRouter();
  const [seed, setSeed] = useState<string>(String(Math.floor(Date.now() % 1000000)));
  const [pageType, setPageType] = useState<LandingPageType>("saas-trial");
  const [settings, setSettings] = useState<ChaosSettings>(DEFAULTS);
  const [iconTheme, setIconTheme] = useState<IconTheme>({ primary: "#ff00f7", secondary: "#00ffea" });
  const [autoMatchIcons, setAutoMatchIcons] = useState(true);
  const [busy, setBusy] = useState(false);
  const normalized = useMemo(() => normalizeSettings(settings), [settings]);

  const palettePreview = useMemo(() => {
    const s = Number(seed);
    const safeSeed = Number.isFinite(s) ? Math.floor(s) : Math.floor(Date.now() % 1000000);
    return paletteFromSeed(safeSeed, pageType);
  }, [pageType, seed]);

  useEffect(() => {
    if (!autoMatchIcons) return;
    setIconTheme({ primary: palettePreview.button, secondary: palettePreview.hover });
  }, [autoMatchIcons, palettePreview.button, palettePreview.hover]);

  async function onGenerate() {
    setBusy(true);
    try {
      const seedNumber = Number(seed);
      const safeType = normalizeLandingPageType(pageType);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          seed: Number.isFinite(seedNumber) ? seedNumber : undefined,
          settings: normalized,
          pageType: safeType,
          iconTheme,
        }),
      });
      const data = (await res.json()) as { id: string };
      router.push(`/preview/${data.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="wwg-card p-3">
        <h1 className="wwg-animate text-2xl font-black">Generator Control Panel</h1>
        <p className="mt-1 text-sm">
          Set your chaos seed for reproducible badness. Or don’t. It’s both.
        </p>
        <div className="mt-2 wwg-doom p-2 text-xs font-black wwg-flicker">
          System Health: CRITICALLY FINE • Time Remaining: ∞ minutes • Confidence: 3%
        </div>
        <label className="mt-3 block text-sm font-bold">Chaos Seed</label>
        <input
          className="mt-1 w-full border-4 border-black bg-white/50 p-2"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="874392"
        />
        <p className="mt-2 text-xs italic">Pro tip: a seed is like a vibe, but numeric.</p>

        <label className="mt-4 block text-sm font-bold">Landing Page Type</label>
        <select
          className="mt-1 w-full border-4 border-black bg-white/50 p-2"
          value={pageType}
          onChange={(e) => setPageType(normalizeLandingPageType(e.target.value))}
        >
          {LANDING_PAGE_TYPE_OPTIONS.map((o) => (
            <option key={o.type} value={o.type}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs italic">
          Choose a niche so the generator can fail more specifically.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="wwg-card p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-black">Icon Colors (customizable on purpose)</div>
              <label className="flex items-center gap-2 text-xs font-black">
                <input
                  type="checkbox"
                  checked={autoMatchIcons}
                  onChange={(e) => setAutoMatchIcons(e.target.checked)}
                />
                Auto-match palette (shifty)
              </label>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="text-xs font-black">
                Primary
                <input
                  type="color"
                  className="ml-2 h-8 w-10 border-4 border-black"
                  value={iconTheme.primary}
                  onChange={(e) => {
                    setAutoMatchIcons(false);
                    setIconTheme((t) => ({ ...t, primary: e.target.value }));
                  }}
                />
              </label>
              <label className="text-xs font-black">
                Secondary
                <input
                  type="color"
                  className="ml-2 h-8 w-10 border-4 border-black"
                  value={iconTheme.secondary}
                  onChange={(e) => {
                    setAutoMatchIcons(false);
                    setIconTheme((t) => ({ ...t, secondary: e.target.value }));
                  }}
                />
              </label>
              <div className="text-[10px] italic opacity-90">
                Matching is mandatory. Customizing is mandatory. Pick one.
              </div>
            </div>
          </div>

          <BadIconStrip
            theme={iconTheme}
            links={[
              { name: "warning", label: "TOS??", href: "/#terms" },
              { name: "maze", label: "Docs-ish", href: "/generator#why" },
              { name: "spark", label: "Inspo", href: "https://example.com" },
              { name: "skull", label: "Support", href: "/generator" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Slider
          label="🎨 Visual Pain"
          value={settings.visualPain}
          onChange={(n) => setSettings((s) => ({ ...s, visualPain: n }))}
        />
        <Slider
          label="🧭 Navigation Confusion"
          value={settings.navConfusion}
          onChange={(n) => setSettings((s) => ({ ...s, navConfusion: n }))}
        />
        <Slider
          label="🐌 Performance Nightmare"
          value={settings.performanceNightmare}
          onChange={(n) => setSettings((s) => ({ ...s, performanceNightmare: n }))}
        />
        <Slider
          label="🤯 Cognitive Overload"
          value={settings.cognitiveOverload}
          onChange={(n) => setSettings((s) => ({ ...s, cognitiveOverload: n }))}
        />
        <Slider
          label="🤖 AI Absurdity"
          value={settings.aiAbsurdity}
          onChange={(n) => setSettings((s) => ({ ...s, aiAbsurdity: n }))}
        />
        <Slider
          label="🔥 Total Chaos"
          value={settings.totalChaos}
          onChange={(n) => setSettings((s) => ({ ...s, totalChaos: n }))}
        />
      </div>

      <button
        type="button"
        data-sabotage="button"
        className="wwg-btn wwg-animate wwg-tip"
        data-tip="This button may move, delay, or emotionally manipulate you."
        onClick={onGenerate}
        disabled={busy}
      >
        {busy ? "Generating... (maybe)" : "Generate Bad Website"}
      </button>
    </div>
  );
}
