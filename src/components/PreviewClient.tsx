"use client";

import JSZip from "jszip";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Generation } from "@/lib/chaos";
import { SabotageLayer } from "@/components/SabotageLayer";
import { BadNav } from "@/components/BadNav";

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function PreviewClient({ generation }: { generation: Generation }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const paletteStyle = useMemo(
    () =>
      ({
        backgroundImage: generation.palette.background,
        borderColor: generation.palette.border,
      }) as React.CSSProperties,
    [generation.palette.background, generation.palette.border],
  );

  async function makeItWorse() {
    setBusy(true);
    try {
      await fetch("/api/sabotage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: generation.id }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function exportZip() {
    setBusy(true);
    try {
      const zip = new JSZip();
      const css = `
body{font-family:Comic Sans MS, Papyrus, system-ui; background:${generation.palette.background}; color:${generation.palette.text};}
.card{border:5px dashed ${generation.palette.border}; padding:16px; margin:16px; background:rgba(255,255,255,.5)}
.btn{display:inline-block; padding:10px 14px; border:3px ridge #000; background:${generation.palette.accentGradient}; color:#111; text-transform:uppercase; letter-spacing:.08em; cursor:wait}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:.2}}
@keyframes wobble{0%{transform:rotate(-1deg) translateY(0)}25%{transform:rotate(2deg) translateY(-2px)}50%{transform:rotate(-3deg) translateY(2px)}75%{transform:rotate(1deg) translateY(-1px)}100%{transform:rotate(-1deg) translateY(0)}}
@keyframes shake{0%{transform:translate(0,0) rotate(-1deg)}25%{transform:translate(1px,-2px) rotate(1deg)}50%{transform:translate(-2px,1px) rotate(-2deg)}75%{transform:translate(2px,2px) rotate(0deg)}100%{transform:translate(0,0) rotate(-1deg)}}
.shake{animation:shake 1.2s infinite linear}
.blink{animation:blink .9s infinite steps(2,end)}
.wobble{animation:wobble 1.3s infinite linear}
.grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px}
.small{font-size:12px; opacity:.9}
`;

      const js = `
// intentionally annoying UX (client-side only)
document.addEventListener('mousemove', (e)=>{
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const btn = el && el.closest && el.closest('[data-sabotage="button"]');
  if(btn && Math.random()<0.33){
    btn.style.position='relative';
    btn.style.left=((Math.random()-.5)*24).toFixed(0)+'px';
    btn.style.top=((Math.random()-.5)*24).toFixed(0)+'px';
  }
});
`;

      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(generation.title)}</title>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>
  <div class="card shake">
    <div class="small blink">Landing Page Type: ${escapeHtml(generation.pageTypeLabel)} (${escapeHtml(generation.pageType)})</div>
    <h1>${escapeHtml(generation.title)}</h1>
    <h1>${escapeHtml(generation.subtitle)}</h1>
    <p>${escapeHtml(generation.heroBody)}</p>
    <p class="small">${escapeHtml(generation.microPanic)}</p>
    <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.primaryCta)}</a>
    <a class="btn" data-sabotage="button" href="#">${escapeHtml(generation.secondaryCta)}</a>
  </div>

  ${generation.pricing
    ? `<div class="card">
    <h2 class="blink">${escapeHtml(generation.pricing.title)}</h2>
    <div class="grid">
      ${generation.pricing.tiers
        .map(
          (t) => `<div class="card wobble">
          <h3>${escapeHtml(t.name)}</h3>
          <p><strong>${escapeHtml(t.price)}</strong></p>
          <ul>${t.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
          <p class="small">${escapeHtml(t.finePrint)}</p>
        </div>`,
        )
        .join("")}
    </div>
  </div>`
    : ""}

  ${generation.products
    ? `<div class="card">
    <h2 class="blink">${escapeHtml(generation.products.title)}</h2>
    <div class="grid">
      ${generation.products.items
        .map(
          (p) => `<div class="card wobble">
          <h3>${escapeHtml(p.name)}</h3>
          <p><strong>${escapeHtml(p.price)}</strong> • <span class="small">${escapeHtml(p.stock)}</span></p>
          <p>${escapeHtml(p.claim)}</p>
          <a class="btn" data-sabotage="button" href="#">Add to Cart-ish</a>
        </div>`,
        )
        .join("")}
    </div>
  </div>`
    : ""}

  ${generation.leadMagnet
    ? `<div class="card">
    <h2 class="blink">${escapeHtml(generation.leadMagnet.title)}</h2>
    <p class="small">Format: ${escapeHtml(generation.leadMagnet.fileType)} • Size: ${escapeHtml(generation.leadMagnet.fakeSize)}</p>
    <ul>${generation.leadMagnet.bonuses.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul>
    <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.leadMagnet.downloadCta)}</a>
  </div>`
    : ""}

  ${generation.aiDemo
    ? `<div class="card">
    <h2 class="blink">${escapeHtml(generation.aiDemo.title)}</h2>
    <p class="small">${escapeHtml(generation.aiDemo.warning)}</p>
    <input class="card" placeholder="${escapeHtml(generation.aiDemo.promptPlaceholder)}"/>
    <ul>${generation.aiDemo.outputs.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
    <a class="btn wobble" data-sabotage="button" href="#">Run AI (offline)</a>
  </div>`
    : ""}

  ${generation.appointment
    ? `<div class="card">
    <h2 class="blink">${escapeHtml(generation.appointment.title)}</h2>
    <ul>${generation.appointment.slots
      .map((s) => `<li><strong>${escapeHtml(s.label)}</strong> — <span class="small">${escapeHtml(s.warning)}</span></li>`)
      .join("")}</ul>
    <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.appointment.phoneCta)}</a>
  </div>`
    : ""}
 
  ${generation.features
    .map(
      (f) => `
  <div class="card">
    <h2>${escapeHtml(f.heading)}</h2>
    <p>${escapeHtml(f.body)}</p>
    <p><small>${escapeHtml(f.disclaimer ?? "")}</small></p>
    <a class="btn" data-sabotage="button" href="#">${escapeHtml(f.ctaLabel ?? "click")}</a>
  </div>`,
    )
    .join("\n")}

  <script src="script.js"></script>
</body>
</html>`;

      zip.file("index.html", html);
      zip.file("styles.css", css);
      zip.file("script.js", js);

      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(`wwg_${generation.id}.zip`, blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen p-5" style={paletteStyle}>
      <SabotageLayer
        performanceNightmare={generation.settings.performanceNightmare}
        totalChaos={generation.settings.totalChaos}
      />

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4">
        <BadNav items={generation.navItems} navConfusion={generation.settings.navConfusion} />

      <header className="wwg-card wwg-animate p-4">
        <h1 className="text-3xl font-black">{generation.title}</h1>
        <h4 className="mt-1 text-lg font-bold">{generation.subtitle}</h4>
        <p className="mt-2">{generation.heroBody}</p>
        <div className="mt-2 text-xs font-black wwg-flicker">
          Landing Page Type: {generation.pageTypeLabel} ({generation.pageType})
        </div>
        <div className="mt-1 text-xs italic">{generation.microPanic}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="wwg-btn" data-sabotage="button" onClick={makeItWorse} disabled={busy}>
            {busy ? "Worsening..." : "Make It Worse"}
          </button>
          <button className="wwg-btn" data-sabotage="button" onClick={exportZip} disabled={busy}>
            Export (Hidden In Plain Sight)
          </button>
          <a className="wwg-btn" data-sabotage="button" href="/generator">
            Regret & Re-Generate
          </a>
        </div>

          <p className="mt-3 text-xs">
            Parody note: this preview intentionally simulates terrible UX for comedy.
          </p>
        </header>

        <section className="wwg-card p-4">
          <h2 className="text-2xl font-black">Warnings (mandatory optional)</h2>
          <ul className="mt-2 list-disc pl-6">
            {generation.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>

        <section className="wwg-card p-4">
          <h2 className="text-2xl font-black">The Main Call-To-Action Area (very believable)</h2>
          <p className="mt-2 text-sm">
            You want one CTA. You get two. Both are urgent. Both are wrong.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="wwg-btn wwg-animate" data-sabotage="button" type="button">
              {generation.primaryCta}
            </button>
            <button className="wwg-btn" data-sabotage="button" type="button">
              {generation.secondaryCta}
            </button>
          </div>
        </section>

        {generation.pricing ? (
          <section className="wwg-card p-4">
            <h2 className="text-2xl font-black">{generation.pricing.title}</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {generation.pricing.tiers.map((t, i) => (
                <div key={i} className="wwg-card p-3">
                  <div className="font-black">{t.name}</div>
                  <div className="mt-1 text-sm font-black">{t.price}</div>
                  <ul className="mt-2 list-disc pl-6 text-sm">
                    {t.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                  <div className="mt-2 text-xs italic">{t.finePrint}</div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generation.products ? (
          <section className="wwg-card p-4">
            <h2 className="text-2xl font-black">{generation.products.title}</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {generation.products.items.map((p, i) => (
                <div key={i} className="wwg-card p-3 wwg-tip" data-tip={p.stock}>
                  <div className="font-black">{p.name}</div>
                  <div className="mt-1 text-sm font-black">{p.price}</div>
                  <div className="mt-1 text-sm">{p.claim}</div>
                  <button className="mt-2 wwg-btn" data-sabotage="button" type="button">
                    Add To Cart-ish
                  </button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {generation.leadMagnet ? (
          <section className="wwg-card p-4">
            <h2 className="text-2xl font-black">{generation.leadMagnet.title}</h2>
            <div className="mt-1 text-xs">
              Format: {generation.leadMagnet.fileType} • Size: {generation.leadMagnet.fakeSize}
            </div>
            <ul className="mt-2 list-disc pl-6 text-sm">
              {generation.leadMagnet.bonuses.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <button className="mt-3 wwg-btn wwg-animate" data-sabotage="button" type="button">
              {generation.leadMagnet.downloadCta}
            </button>
          </section>
        ) : null}

        {generation.aiDemo ? (
          <section className="wwg-card p-4">
            <h2 className="text-2xl font-black">{generation.aiDemo.title}</h2>
            <div className="mt-1 text-xs italic">{generation.aiDemo.warning}</div>
            <input
              className="mt-3 w-full border-4 border-black bg-white/50 p-2"
              placeholder={generation.aiDemo.promptPlaceholder}
            />
            <div className="mt-2 text-sm font-black">Sample outputs (pre-failed)</div>
            <ul className="mt-2 list-disc pl-6 text-sm">
              {generation.aiDemo.outputs.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
            <button className="mt-3 wwg-btn" data-sabotage="button" type="button">
              Run AI (offline)
            </button>
          </section>
        ) : null}

        {generation.appointment ? (
          <section className="wwg-card p-4">
            <h2 className="text-2xl font-black">{generation.appointment.title}</h2>
            <ul className="mt-2 list-disc pl-6 text-sm">
              {generation.appointment.slots.map((s, i) => (
                <li key={i}>
                  <span className="font-black">{s.label}</span> — <span className="italic">{s.warning}</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 wwg-btn wwg-animate" data-sabotage="button" type="button">
              {generation.appointment.phoneCta}
            </button>
          </section>
        ) : null}

        {generation.features.map((f, i) => (
          <section key={i} className="wwg-card p-4">
            <h1 className="text-xl font-black">{f.heading}</h1>
            <p className="mt-1">{f.body}</p>
            {f.disclaimer ? <p className="mt-2 text-xs italic">{f.disclaimer}</p> : null}
            <div className="mt-3">
              <button className="wwg-btn wwg-animate" data-sabotage="button" type="button">
                {f.ctaLabel ?? "CLICK"}
              </button>
            </div>
          </section>
        ))}

        <section className="wwg-card p-4">
          <h2 className="text-2xl font-black">Testimonials (all true and false)</h2>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {generation.testimonials.map((t, i) => (
              <div key={i} className="wwg-card p-3">
                <div className="font-black">{t.name}</div>
                <div className="mt-1 text-sm">“{t.quote}”</div>
              </div>
            ))}
          </div>
        </section>

        <section className="wwg-card p-4">
          <h2 className="text-2xl font-black">FAQ (less helpful than silence)</h2>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {generation.faq.map((f, i) => (
              <details key={i} className="wwg-card p-3">
                <summary className="cursor-help font-black">{f.q}</summary>
                <p className="mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="wwg-card p-4">
          <h2 className="text-2xl font-black">{generation.form.title}</h2>
          <p className="mt-1 text-sm">
            Contradictory instruction: please fill everything. Also, do not provide any
            information.
          </p>
          <form
            className="mt-3 grid grid-cols-1 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Submitted! (not really)");
            }}
          >
            {generation.form.fields.slice(0, 22).map((field) => (
              <div key={field.name} className="wwg-card p-3">
                <div className="text-sm font-black">{field.label}</div>
                <input
                  className="mt-1 w-full border-4 border-black bg-white/50 p-2"
                  name={field.name}
                  placeholder={field.placeholder}
                />
                <div className="mt-1 text-xs italic">{field.whyRequired}</div>
              </div>
            ))}
            <div className="wwg-card p-3">
              <div className="font-black">Impossible Captcha</div>
              <p className="mt-1 text-sm">{generation.form.captchaInstruction}</p>
            </div>
            <button className="wwg-btn wwg-animate" data-sabotage="button" type="submit">
              Submit Regret
            </button>
          </form>
        </section>

        <footer className="wwg-card p-4">
          <div className="text-sm">
            Footer placed near the bottom (unfortunately). Seed: {generation.seed} • Version:{" "}
            {generation.version}
          </div>
        </footer>
      </div>
    </div>
  );
}
