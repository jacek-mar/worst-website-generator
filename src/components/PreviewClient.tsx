"use client";

import JSZip from "jszip";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Generation } from "@/lib/chaos";
import { createRng } from "@/lib/chaos";
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

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupClosable, setPopupClosable] = useState(false);
  const [visitorCount, setVisitorCount] = useState<number | null>(
    generation.visitorCounter?.enabled ? generation.visitorCounter.start : null,
  );
  const [wizardStep, setWizardStep] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaVerdict, setCaptchaVerdict] = useState<string | null>(null);
  const dodgeRef = useRef<HTMLButtonElement | null>(null);
  const paletteStyle = useMemo(
    () =>
      ({
        backgroundImage: makeBackgroundImage(generation),
        borderColor: generation.palette.border,
      }) as React.CSSProperties,
    [generation],
  );

  const animClass = useMemo(() => {
    switch (generation.animationPreset) {
      case "wobble":
        return "wwg-anim-wobble";
      case "blink":
        return "wwg-anim-blink";
      case "floaty":
        return "wwg-anim-floaty";
      case "shake":
      default:
        return "wwg-anim-shake";
    }
  }, [generation.animationPreset]);

  const visibleFieldCount = useMemo(() => {
    const rng = createRng(generation.seed ^ 0x5bd1e995);
    const max = generation.form.fields.length;
    if (generation.formVariant === "short") return Math.min(max, 6 + Math.floor(rng() * 7)); // 6-12
    if (generation.formVariant === "wizard") return Math.min(max, 10 + Math.floor(rng() * 10)); // 10-19
    return Math.min(max, 12 + Math.floor(rng() * 16)); // 12-27
  }, [generation.form.fields.length, generation.formVariant, generation.seed]);

  const wizardFields = useMemo(() => {
    const fields = generation.form.fields.slice(0, visibleFieldCount);
    const steps = 3;
    const chunk = Math.max(1, Math.ceil(fields.length / steps));
    return Array.from({ length: steps }, (_, i) => fields.slice(i * chunk, (i + 1) * chunk));
  }, [generation.form.fields, visibleFieldCount]);

  useEffect(() => {
    // Popup trap: opens after a delay, closes after an even worse delay.
    if (!generation.popupTrap?.enabled) return;
    const openId = window.setTimeout(() => setPopupOpen(true), 700 + (generation.settings.navConfusion ?? 0) * 120);
    const closeId = window.setTimeout(
      () => setPopupClosable(true),
      Math.max(600, generation.popupTrap.closeDelayMs),
    );
    return () => {
      window.clearTimeout(openId);
      window.clearTimeout(closeId);
    };
  }, [generation.popupTrap, generation.settings.navConfusion]);

  useEffect(() => {
    // Visitor counter that makes no sense, but looks official.
    if (!generation.visitorCounter?.enabled) return;
    const id = window.setInterval(() => {
      setVisitorCount((prev) => {
        const base = prev ?? generation.visitorCounter!.start;
        const jump = 1 + Math.floor(Math.random() * 7);
        return base + jump;
      });
    }, 1400 + generation.settings.performanceNightmare * 120);
    return () => window.clearInterval(id);
  }, [generation.settings.performanceNightmare, generation.visitorCounter]);

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
      const navPlacement = generation.navPlacement;
      const heroVariant = generation.heroVariant;
      const formVariant = generation.formVariant;
      const bgEffect = generation.backgroundEffect;
      const animPreset = generation.animationPreset;

      const animClassForExport =
        animPreset === "wobble"
          ? "wobble"
          : animPreset === "blink"
            ? "blink"
            : animPreset === "floaty"
              ? "floaty"
              : "shake";

      const bgLayer = backgroundLayerForExport(bgEffect);
      const css = `
body{font-family:Comic Sans MS, Papyrus, system-ui; background-image:${bgLayer}, ${generation.palette.background}; color:${generation.palette.text};}
.card{border:5px dashed ${generation.palette.border}; padding:16px; margin:16px; background:rgba(255,255,255,.5)}
.btn{display:inline-block; padding:10px 14px; border:3px ridge #000; background:${generation.palette.accentGradient}; color:#111; text-transform:uppercase; letter-spacing:.08em; cursor:wait}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:.2}}
@keyframes wobble{0%{transform:rotate(-1deg) translateY(0)}25%{transform:rotate(2deg) translateY(-2px)}50%{transform:rotate(-3deg) translateY(2px)}75%{transform:rotate(1deg) translateY(-1px)}100%{transform:rotate(-1deg) translateY(0)}}
@keyframes shake{0%{transform:translate(0,0) rotate(-1deg)}25%{transform:translate(1px,-2px) rotate(1deg)}50%{transform:translate(-2px,1px) rotate(-2deg)}75%{transform:translate(2px,2px) rotate(0deg)}100%{transform:translate(0,0) rotate(-1deg)}}
.blink{animation:blink .9s infinite steps(2,end)}
.wobble{animation:wobble 1.3s infinite linear}
.shake{animation:shake 1.2s infinite linear}
@keyframes floaty{0%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-6px) rotate(1deg)}100%{transform:translateY(0) rotate(-1deg)}}
.floaty{animation:floaty 1.6s infinite ease-in-out}
.shake{animation:shake 1.2s infinite linear}
.grid{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px}
.small{font-size:12px; opacity:.9}

.layout{display:flex; gap:12px}
.layout[data-nav="top"]{flex-direction:column}
.layout[data-nav="left"]{flex-direction:row}
.layout[data-nav="right"]{flex-direction:row-reverse}
.navcol{min-width:220px; max-width:320px}
.main{flex:1}

.modal{position:fixed; inset:0; background:rgba(0,0,0,.5); display:none; align-items:center; justify-content:center}
.modal.open{display:flex}
.modal .inner{max-width:min(720px,92vw); border:6px double #000; background:rgba(255,255,255,.7)}
.counter{position:fixed; bottom:10px; left:10px; border:4px dotted #000; background:rgba(255,255,255,.6); padding:8px 10px}
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

// visitor counter (nonsense edition)
const vc=document.querySelector('[data-visitor-counter]');
if(vc){
  setInterval(()=>{
    const n=Number(vc.getAttribute('data-value')||'0')||0;
    const next=n+(1+Math.floor(Math.random()*7));
    vc.setAttribute('data-value', String(next));
    vc.textContent=String(next);
  }, ${1400 + generation.settings.performanceNightmare * 120});
}

// popup trap
const modal=document.querySelector('[data-modal]');
const closeBtn=document.querySelector('[data-close]');
if(modal && closeBtn){
  const delay=${Math.max(600, generation.popupTrap?.closeDelayMs ?? 1400)};
  setTimeout(()=>{ modal.classList.add('open'); }, ${700 + generation.settings.navConfusion * 120});
  setTimeout(()=>{ closeBtn.removeAttribute('disabled'); }, delay);
  closeBtn.addEventListener('mouseenter', ()=>{
    if(closeBtn.getAttribute('data-dodge')!=='1') return;
    closeBtn.style.position='relative';
    closeBtn.style.left=((Math.random()-.5)*80).toFixed(0)+'px';
    closeBtn.style.top=((Math.random()-.5)*50).toFixed(0)+'px';
  });
  closeBtn.addEventListener('click', ()=>{ modal.classList.remove('open'); });
}

// wizard-ish form
const wizard=document.querySelector('[data-wizard]');
if(wizard){
  let step=0;
  const steps=[...wizard.querySelectorAll('[data-step]')];
  function show(){
    steps.forEach((s,i)=>{ s.style.display=i===step?'block':'none'; });
  }
  wizard.addEventListener('click', (e)=>{
    const t=e.target;
    if(!(t instanceof HTMLElement)) return;
    if(t.matches('[data-next]')){ step=Math.min(steps.length-1, step+1); show(); }
    if(t.matches('[data-prev]')){ step=Math.max(0, step-1); show(); }
  });
  show();
}
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
  <div class="layout" data-nav="${escapeHtml(navPlacement)}">
    <div class="navcol">
      <div class="card ${animClassForExport}">
        <div class="small blink">Navigation (reliable-ish)</div>
        ${generation.navItems
          .slice(0, 8)
          .map((n) => `<div><a class="btn" data-sabotage="button" href="${escapeHtml(n.href)}">${escapeHtml(n.label)}</a></div>`)
          .join("")}
        <div class="small">Breadcrumb: /you/are/here/but/no</div>
      </div>
    </div>
    <div class="main">
      ${heroVariant === "no-banner"
        ? `<div class="card ${animClassForExport}">
          <div class="small blink">Landing Page Type: ${escapeHtml(generation.pageTypeLabel)} (${escapeHtml(generation.pageType)})</div>
          <h1>${escapeHtml(generation.title)}</h1>
          <p class="small">Hero removed for your comfort. (this is a lie)</p>
          <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.primaryCta)}</a>
          <a class="btn" data-sabotage="button" href="#">${escapeHtml(generation.secondaryCta)}</a>
        </div>`
        : heroVariant === "split"
          ? `<div class="card ${animClassForExport}">
            <div class="grid">
              <div>
                <div class="small blink">Landing Page Type: ${escapeHtml(generation.pageTypeLabel)} (${escapeHtml(generation.pageType)})</div>
                <h1>${escapeHtml(generation.title)}</h1>
                <h1>${escapeHtml(generation.subtitle)}</h1>
              </div>
              <div>
                <p>${escapeHtml(generation.heroBody)}</p>
                <p class="small">${escapeHtml(generation.microPanic)}</p>
                <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.primaryCta)}</a>
                <a class="btn" data-sabotage="button" href="#">${escapeHtml(generation.secondaryCta)}</a>
              </div>
            </div>
          </div>`
          : `<div class="card ${animClassForExport}">
            <div class="small blink">Landing Page Type: ${escapeHtml(generation.pageTypeLabel)} (${escapeHtml(generation.pageType)})</div>
            <h1>${escapeHtml(generation.title)}</h1>
            <h1>${escapeHtml(generation.subtitle)}</h1>
            <p>${escapeHtml(generation.heroBody)}</p>
            <p class="small">${escapeHtml(generation.microPanic)}</p>
            <a class="btn wobble" data-sabotage="button" href="#">${escapeHtml(generation.primaryCta)}</a>
            <a class="btn" data-sabotage="button" href="#">${escapeHtml(generation.secondaryCta)}</a>
          </div>`}

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

  <div class="card ${animClassForExport}">
    <h2>${escapeHtml(generation.form.title)} (${escapeHtml(formVariant)})</h2>
    <p class="small">${escapeHtml(generation.form.captchaInstruction)}</p>
    ${formVariant === "wizard"
      ? `<div data-wizard>
          <div class="small">Wizard mode: step order may not be chronological.</div>
          <div data-step>
            <p><strong>Step 1:</strong> Start by finishing.</p>
            <input class="card" placeholder="Field?"/>
            <button class="btn" data-next type="button">Next (maybe)</button>
          </div>
          <div data-step>
            <p><strong>Step 2:</strong> Tell us something unnecessary.</p>
            <input class="card" placeholder="Your vibe"/>
            <button class="btn" data-prev type="button">Back (forward)</button>
            <button class="btn" data-next type="button">Next (still)</button>
          </div>
          <div data-step>
            <p><strong>Step 3:</strong> Captcha</p>
            <div class="card">
              <div class="small">${escapeHtml(generation.form.captcha.prompt)}</div>
              <input class="card" placeholder="type answer then don’t"/>
            </div>
            <button class="btn" type="button">Submit (offline)</button>
          </div>
        </div>`
      : `<div>
          <div class="card"><div class="small">Captcha:</div>${escapeHtml(generation.form.captcha.prompt)}</div>
          <input class="card" placeholder="Captcha answer"/>
          <button class="btn" type="button">Submit regret</button>
        </div>`}
  </div>

  ${generation.visitorCounter?.enabled ? `<div class="counter">${escapeHtml(generation.visitorCounter.label)}: <span data-visitor-counter data-value="${generation.visitorCounter.start}">${generation.visitorCounter.start}</span></div>` : ""}

  ${generation.popupTrap?.enabled ? `<div class="modal" data-modal><div class="inner card ${animClassForExport}"><h2>${escapeHtml(generation.popupTrap.title)}</h2><p>${escapeHtml(generation.popupTrap.body)}</p><button class="btn" data-close ${generation.popupTrap.movesAway ? 'data-dodge="1"' : ''} disabled>${escapeHtml(generation.popupTrap.closeLabel)}</button><p class="small">(closing available after waiting)</p></div></div>` : ""}
    </div>
  </div>

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
    <div className={`min-h-screen p-5 ${animClass}`} style={paletteStyle}>
      <SabotageLayer
        performanceNightmare={generation.settings.performanceNightmare}
        totalChaos={generation.settings.totalChaos}
      />

      {generation.popupTrap?.enabled && popupOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className={`wwg-card wwg-doom ${animClass} w-[min(820px,96vw)] p-4`}>
            <div className="text-xs font-black">Popup Trap (parody) • close button may dodge</div>
            <h2 className="mt-1 text-2xl font-black">{generation.popupTrap.title}</h2>
            <p className="mt-2 text-sm">{generation.popupTrap.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                ref={dodgeRef}
                type="button"
                data-sabotage="button"
                className="wwg-btn"
                disabled={!popupClosable}
                onMouseEnter={() => {
                  if (!generation.popupTrap?.movesAway) return;
                  const el = dodgeRef.current;
                  if (!el) return;
                  el.style.position = "relative";
                  el.style.left = `${Math.floor((Math.random() - 0.5) * 120)}px`;
                  el.style.top = `${Math.floor((Math.random() - 0.5) * 80)}px`;
                }}
                onClick={() => setPopupOpen(false)}
              >
                {generation.popupTrap.closeLabel}
              </button>
              <div className="text-xs italic">
                {popupClosable
                  ? "You may now close it (or may you?)."
                  : `Close enabled after ${generation.popupTrap.closeDelayMs}ms of personal growth.`}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {generation.visitorCounter?.enabled && visitorCount !== null ? (
        <div className="fixed bottom-3 left-3 z-50 w-[min(92vw,320px)]">
          <div className={`wwg-card ${animClass} p-3 text-xs font-black`}>
            {generation.visitorCounter.label}: <span className="wwg-flicker">{visitorCount}</span>
            <div className="mt-1 text-[10px] italic">(approx. excludes robots, includes ghosts)</div>
          </div>
        </div>
      ) : null}

      <div
        className={
          generation.navPlacement === "top"
            ? "mx-auto grid max-w-5xl grid-cols-1 gap-4"
            : "mx-auto flex max-w-6xl flex-col gap-4 md:flex-row"
        }
      >
        {generation.navPlacement === "top" ? (
          <BadNav items={generation.navItems} navConfusion={generation.settings.navConfusion} />
        ) : null}

        {generation.navPlacement === "left" ? (
          <div className="md:w-[260px] md:flex-none">
            <BadNav items={generation.navItems} navConfusion={generation.settings.navConfusion} />
          </div>
        ) : null}

        <div className="grid flex-1 grid-cols-1 gap-4">

          {generation.heroVariant === "no-banner" ? (
            <header className={`wwg-card ${animClass} p-4`}>
              <div className="text-xs font-black wwg-flicker">
                Landing Page Type: {generation.pageTypeLabel} ({generation.pageType})
              </div>
              <h1 className="mt-2 text-2xl font-black">{generation.title}</h1>
              <p className="mt-2 text-sm italic">
                Hero removed to improve readability. (This statement is intentionally incorrect.)
              </p>
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
            </header>
          ) : generation.heroVariant === "split" ? (
            <header className={`wwg-card ${animClass} p-4`}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <h1 className="text-3xl font-black">{generation.title}</h1>
                  <h4 className="mt-1 text-lg font-bold">{generation.subtitle}</h4>
                  <div className="mt-2 text-xs font-black wwg-flicker">
                    Landing Page Type: {generation.pageTypeLabel} ({generation.pageType})
                  </div>
                </div>
                <div>
                  <p className="mt-1">{generation.heroBody}</p>
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
                </div>
              </div>
              <p className="mt-3 text-xs">Parody note: this preview intentionally simulates terrible UX for comedy.</p>
            </header>
          ) : (
            <header className={`wwg-card ${animClass} p-4`}>
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
              <p className="mt-3 text-xs">Parody note: this preview intentionally simulates terrible UX for comedy.</p>
            </header>
          )}

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
          {generation.formVariant === "wizard" ? (
            <div className="mt-3">
              <div className="wwg-card p-3 text-xs italic">
                Wizard mode: step {wizardStep + 1} of {wizardFields.length}. Steps may be out of order for realism.
              </div>
              <form
                className="mt-3 grid grid-cols-1 gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Submitted! (not really)");
                }}
              >
                {wizardFields[wizardStep]?.map((field) => (
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

                {wizardStep === wizardFields.length - 1 ? (
                  <div className="wwg-card p-3">
                    <div className="font-black">Captcha (impossible but also doable)</div>
                    <p className="mt-1 text-sm">{generation.form.captchaInstruction}</p>
                    <p className="mt-2 text-sm font-black">{generation.form.captcha.prompt}</p>
                    <input
                      className="mt-2 w-full border-4 border-black bg-white/50 p-2"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      placeholder="Answer (then don’t)"
                    />
                    {captchaVerdict ? <div className="mt-1 text-xs italic">{captchaVerdict}</div> : null}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button
                    className="wwg-btn"
                    data-sabotage="button"
                    type="button"
                    onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
                    disabled={wizardStep === 0}
                  >
                    Back (Forward)
                  </button>
                  {wizardStep < wizardFields.length - 1 ? (
                    <button
                      className="wwg-btn wwg-animate"
                      data-sabotage="button"
                      type="button"
                      onClick={() => setWizardStep((s) => Math.min(wizardFields.length - 1, s + 1))}
                    >
                      Next (Previous)
                    </button>
                  ) : (
                    <button
                      className="wwg-btn wwg-animate"
                      data-sabotage="button"
                      type="submit"
                      onClick={() => {
                        const expected = generation.form.captcha.expected.trim();
                        const got = captchaAnswer.trim();
                        const spite = generation.settings.totalChaos >= 8 ? 0.35 : 0.18;
                        const ok = got === expected && Math.random() > spite;
                        setCaptchaVerdict(ok ? "Captcha accepted (suspiciously)." : "Captcha failed (even if correct). Try feeling more human.");
                        if (!ok) {
                          // keep user in wizard purgatory
                          alert("Captcha said: no.");
                        }
                      }}
                    >
                      Submit Regret
                    </button>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <form
              className="mt-3 grid grid-cols-1 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Submitted! (not really)");
              }}
            >
              {generation.form.fields.slice(0, visibleFieldCount).map((field) => (
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
                <div className="font-black">Captcha (still bad)</div>
                <p className="mt-1 text-sm">{generation.form.captchaInstruction}</p>
                <p className="mt-2 text-sm font-black">{generation.form.captcha.prompt}</p>
                <input
                  className="mt-2 w-full border-4 border-black bg-white/50 p-2"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Answer (optional mandatory)"
                />
                {captchaVerdict ? <div className="mt-1 text-xs italic">{captchaVerdict}</div> : null}
              </div>
              <button
                className="wwg-btn wwg-animate"
                data-sabotage="button"
                type="submit"
                onClick={() => {
                  const expected = generation.form.captcha.expected.trim();
                  const got = captchaAnswer.trim();
                  const spite = generation.settings.totalChaos >= 8 ? 0.32 : 0.14;
                  const ok = got === expected && Math.random() > spite;
                  setCaptchaVerdict(ok ? "Captcha accepted (begrudgingly)." : "Captcha failed (unreasonably). Please try again louder.");
                }}
              >
                Submit Regret
              </button>
            </form>
          )}
        </section>

        <footer className="wwg-card p-4">
          <div className="text-sm">
            Footer placed near the bottom (unfortunately). Seed: {generation.seed} • Version:{" "}
            {generation.version}
          </div>
        </footer>
        </div>

        {generation.navPlacement === "right" ? (
          <div className="md:w-[260px] md:flex-none">
            <BadNav items={generation.navItems} navConfusion={generation.settings.navConfusion} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function makeBackgroundImage(g: Generation) {
  const pattern = backgroundLayerForExport(g.backgroundEffect);
  return `${pattern}, ${g.palette.background}`;
}

function backgroundLayerForExport(effect: Generation["backgroundEffect"]) {
  switch (effect) {
    case "polka":
      return "radial-gradient(circle at 20% 20%, rgba(255,255,255,.35) 0 6px, transparent 7px), radial-gradient(circle at 70% 55%, rgba(0,0,0,.12) 0 5px, transparent 6px)";
    case "checker":
      return "linear-gradient(45deg, rgba(0,0,0,.14) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.14) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.14) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.14) 75%)";
    case "confetti":
      return "repeating-radial-gradient(circle at 10% 20%, rgba(255,255,255,.25) 0 4px, transparent 6px 12px)";
    case "scanlines":
    default:
      return "repeating-linear-gradient(to bottom, rgba(0,0,0,.10), rgba(0,0,0,.10) 1px, transparent 3px, transparent 6px)";
  }
}
