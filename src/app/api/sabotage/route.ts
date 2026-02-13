import { NextResponse } from "next/server";
import { generateWorstSite, worsenSettings } from "@/lib/chaos";
import { getGeneration, putGeneration } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string };
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const current = getGeneration(id);
    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const worsened = worsenSettings(current.settings);
    const regen = generateWorstSite(current.seed, worsened, current.pageType, {
      iconTheme: current.iconTheme,
    });
    regen.id = current.id;
    regen.version = current.version + 1;
    regen.createdAt = current.createdAt;
    putGeneration(regen);

    return NextResponse.json({ ok: true, id, version: regen.version, settings: regen.settings });
  } catch {
    return NextResponse.json({ error: "Sabotage failed successfully." }, { status: 500 });
  }
}
