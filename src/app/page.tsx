import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <div className="wwg-card wwg-wobble mx-auto max-w-3xl p-6">
        <h1 className="wwg-animate text-4xl font-black">Worst Website Generator</h1>
        <h1 className="mt-2 text-xl font-semibold">(yes, TWO H1s. you’re welcome)</h1>

        <p className="mt-4 leading-relaxed">
          This app is intentionally bad. It generates websites that are equally bad.
          Please do not learn best practices from this.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link className="wwg-btn wwg-animate inline-block text-center" href="/generator">
            Proceed Maybe
          </Link>
          <Link className="wwg-btn inline-block text-center" href="/preview/does-not-exist">
            Preview Something (Probably)
          </Link>
        </div>

        <p className="mt-6 text-sm">
          Unnecessary warning #1: do not feed after midnight. Unnecessary warning #2:
          clicking may cause mild confusion. Unnecessary warning #3: this warning is not
          a warning.
        </p>

        <p className="mt-3 text-xs italic">
          “If you can read this, your contrast is too high.”
        </p>
      </div>
    </main>
  );
}
