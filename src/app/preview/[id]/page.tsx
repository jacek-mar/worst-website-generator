import { getGeneration } from "@/lib/store";
import { PreviewClient } from "@/components/PreviewClient";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gen = getGeneration(id);

  if (!gen) {
    return (
      <main className="min-h-screen p-6">
        <div className="wwg-card wwg-animate mx-auto max-w-2xl p-6">
          <h1 className="text-3xl font-black">Preview Not Found (Probably Your Fault)</h1>
          <p className="mt-2">
            This preview id does not exist in the in-memory chaos vault. Which is both a
            bug and a feature.
          </p>
          <a className="wwg-btn mt-4 inline-block" href="/generator">
            Generate Another Regret
          </a>
        </div>
      </main>
    );
  }

  return <PreviewClient generation={gen} />;
}

