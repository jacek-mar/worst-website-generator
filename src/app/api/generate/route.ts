import { NextResponse } from "next/server";
import {
  generateWorstSite,
  normalizeLandingPageType,
  normalizeSettings,
  type ChaosSettings,
  type LandingPageType,
} from "@/lib/chaos";
import { putGeneration } from "@/lib/store";

function makeId() {
  // stable-ish, short-ish, not secure (fine for hackathon demo)
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      seed?: number;
      settings?: Partial<ChaosSettings>;
      pageType?: LandingPageType;
    };

    const seed = Number.isFinite(body.seed)
      ? Math.floor(Number(body.seed))
      : Math.floor(Date.now() % 1000000);

    const settings = normalizeSettings(body.settings);
    const pageType = normalizeLandingPageType(body.pageType);
    const id = makeId();

    const gen = generateWorstSite(seed, settings, pageType);
    gen.id = id;

    putGeneration(gen);
    return NextResponse.json({ id, seed, settings, pageType });
  } catch {
    return NextResponse.json(
      { error: "Generation failed (ironically)." },
      { status: 500 },
    );
  }
}
