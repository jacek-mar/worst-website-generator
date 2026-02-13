import { ChaosControls } from "@/components/ChaosControls";

export default function GeneratorPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
          <div className="wwg-card wwg-wobble p-4">
            <ChaosControls />
          </div>

          <aside className="wwg-card wwg-animate p-4">
            <h1 className="text-xl font-black">How To Use</h1>
            <ol className="mt-2 list-decimal pl-5 text-sm">
              <li>Pick settings</li>
              <li>Regret the settings</li>
              <li>Click generate</li>
              <li>Forget what you wanted</li>
              <li>Export and pretend it’s a feature</li>
            </ol>
            <p className="mt-3 text-xs italic">
              This sidebar is intentionally more confident than correct.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

