"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChaosSettings } from "@/lib/chaos";
import { normalizeSettings } from "@/lib/chaos";

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
  const [settings, setSettings] = useState<ChaosSettings>(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const normalized = useMemo(() => normalizeSettings(settings), [settings]);

  async function onGenerate() {
    setBusy(true);
    try {
      const seedNumber = Number(seed);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed: Number.isFinite(seedNumber) ? seedNumber : undefined, settings: normalized }),
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
