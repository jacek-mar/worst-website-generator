import { NextResponse } from "next/server";
import { generateWorstSite, normalizeSettings, type ChaosSettings } from "@/lib/chaos";
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
    };

    const seed = Number.isFinite(body.seed)
      ? Math.floor(Number(body.seed))
      : Math.floor(Date.now() % 1000000);

    const settings = normalizeSettings(body.settings);
    const id = makeId();

    const gen = generateWorstSite(seed, settings);
    gen.id = id;

    putGeneration(gen);
    return NextResponse.json({ id, seed, settings });
  } catch {
    return NextResponse.json(
      { error: "Generation failed (ironically)." },
      { status: 500 },
    );
  }
}

