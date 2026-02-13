# Active Context: Next.js Starter Template

## Current State

**Template Status**: ✅ Expanded into “Worst Website Generator” hackathon app

The template is a clean Next.js 16 starter with TypeScript and Tailwind CSS 4. It's ready for AI-assisted expansion to build any type of application.

## Recently Completed

- [x] Base Next.js 16 setup with App Router
- [x] TypeScript configuration with strict mode
- [x] Tailwind CSS 4 integration
- [x] ESLint configuration
- [x] Memory bank documentation
- [x] Recipe system for common features
- [x] Implemented Worst Website Generator (WWG) pages: `/`, `/generator`, `/preview/[id]`
- [x] Added seed-based “bad site” generator + palette generator
- [x] Added satire-safe UX sabotage layer (delays, button dodge, occasional reverse scroll, noisy alerts)
- [x] Added API routes: `POST /api/generate` and `POST /api/sabotage` (“Make It Worse”)
- [x] Added in-memory generation store for previews (hackathon demo)
- [x] Added export-to-zip for generated bad websites
- [x] Verified `bun lint` and `bun typecheck` passing

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Home page | ✅ Ready |
| `src/app/layout.tsx` | Root layout | ✅ Ready |
| `src/app/globals.css` | Global styles | ✅ Ready |
| `.kilocode/` | AI context & recipes | ✅ Ready |
| `src/app/generator/page.tsx` | Generator control panel (sliders + seed) | ✅ Added |
| `src/app/preview/[id]/page.tsx` | Generated “bad site” preview | ✅ Added |
| `src/app/api/generate/route.ts` | Create generation (seed + settings) | ✅ Added |
| `src/app/api/sabotage/route.ts` | Escalate “badness” for an id | ✅ Added |
| `src/lib/chaos.ts` | Deterministic RNG + content/palette generator | ✅ Added |
| `src/lib/store.ts` | In-memory store (demo-only) | ✅ Added |
| `src/components/*` | Bad nav + sabotage layer + preview UI | ✅ Added |

## Current Focus

WWG is implemented as a hackathon-friendly demo. Next steps (if needed):

1. Persist generations (DB) instead of in-memory store
2. Add more export templates (multi-page, assets)
3. Add “modes” (mild → total collapse) and shareable URLs

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-02-13 | Built Worst Website Generator: generator UI, seed-based preview, sabotage layer, APIs, zip export |
