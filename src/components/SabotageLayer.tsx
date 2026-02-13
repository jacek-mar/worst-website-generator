"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function SabotageLayer({
  performanceNightmare,
  totalChaos,
}: {
  performanceNightmare: number;
  totalChaos: number;
}) {
  const [annoyingMessage, setAnnoyingMessage] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const pending = useRef<number | null>(null);
  const chaos = useMemo(() => Math.max(0, Math.min(10, totalChaos)), [totalChaos]);

  useEffect(() => {
    // Random alerts (harmless) – limited.
    if (chaos < 7) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.16) {
        setAnnoyingMessage(
          [
            "System message: you are doing great. stop.",
            "Reminder: the button is decorative.",
            "Alert: this alert is not important.",
            "Notice: please ignore this notice.",
          ][Math.floor(Math.random() * 4)]!,
        );
        window.setTimeout(() => setAnnoyingMessage(null), 1800);
      }
    }, 2500);
    return () => window.clearInterval(id);
  }, [chaos]);

  useEffect(() => {
    // Fake consent banner that appears when you least need it.
    if (chaos < 6) return;
    const id = window.setTimeout(() => {
      setConsentOpen(true);
    }, 1600);
    return () => window.clearTimeout(id);
  }, [chaos]);

  useEffect(() => {
    // Occasionally reverse scroll direction.
    if (chaos < 8) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.random() < 0.08) {
        e.preventDefault();
        window.scrollBy({ top: -e.deltaY, left: 0, behavior: "auto" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [chaos]);

  useEffect(() => {
    // Delay clicks by a few seconds (client-side only).
    if (performanceNightmare < 6) return;

    const onClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isButtonish =
        target.closest?.('[data-sabotage="button"]') ||
        target.tagName === "BUTTON" ||
        target.getAttribute("role") === "button";
      if (!isButtonish) return;
      if (pending.current !== null) return;

      // Don’t block links completely; just annoy.
      e.stopPropagation();
      e.preventDefault();

      const delayMs = 2000 + Math.floor(Math.random() * (performanceNightmare * 600));
      setAnnoyingMessage(`Loading... ${delayMs}ms (approx).`);
      pending.current = window.setTimeout(() => {
        pending.current = null;
        setAnnoyingMessage(null);
        // Re-dispatch a click (best-effort).
        (target as HTMLElement).click?.();
      }, delayMs);
    };

    document.addEventListener("click", onClickCapture, true);
    return () => {
      document.removeEventListener("click", onClickCapture, true);
      if (pending.current !== null) window.clearTimeout(pending.current);
      pending.current = null;
    };
  }, [performanceNightmare]);

  useEffect(() => {
    // Make some buttons move away from cursor.
    if (chaos < 6) return;
    const onMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const btn = el?.closest?.('[data-sabotage="button"]') as HTMLElement | null;
      if (!btn) return;
      if (Math.random() < 0.35) {
        btn.style.position = "relative";
        btn.style.left = `${Math.floor((Math.random() - 0.5) * 24)}px`;
        btn.style.top = `${Math.floor((Math.random() - 0.5) * 24)}px`;
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [chaos]);

  if (!annoyingMessage) return null;
  return (
    <>
      <div className="fixed left-3 top-3 z-50 w-[min(92vw,520px)]">
        <div className="wwg-card wwg-animate p-3 text-sm">
          {annoyingMessage}
          <div className="mt-1 text-xs italic">(this message is both urgent and irrelevant)</div>
        </div>
      </div>

      {consentOpen ? (
        <div className="fixed bottom-3 right-3 z-50 w-[min(92vw,560px)]">
          <div className="wwg-card wwg-doom wwg-flicker p-3 text-sm">
            <div className="font-black">Cookie Consent (Mandatory Optional)</div>
            <p className="mt-1 text-xs">
              We use cookies to improve your experience, worsen your experience, and to
              remember that you forgot to consent.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                data-sabotage="button"
                className="wwg-btn"
                onClick={() => setConsentOpen(false)}
              >
                Accept Refuse
              </button>
              <button
                type="button"
                data-sabotage="button"
                className="wwg-btn"
                onClick={() => setConsentOpen(false)}
              >
                Refuse Accept
              </button>
              <button
                type="button"
                data-sabotage="button"
                className="wwg-btn"
                onClick={() => setConsentOpen(false)}
              >
                More Options (Fewer)
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
