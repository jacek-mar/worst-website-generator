import type { BadIconLink, BadIconTheme } from "@/lib/bad-icons";
import { BadIcon } from "@/components/BadIcon";

export function BadIconStrip({
  links,
  theme,
  className,
  size,
}: {
  links: BadIconLink[];
  theme: BadIconTheme;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={
        className ??
        "wwg-card wwg-wobble flex flex-wrap items-center justify-between gap-2 p-2"
      }
      style={
        {
          // Also set vars for CSS effects if someone wants to use them.
          "--wwg-icon-primary": theme.primary,
          "--wwg-icon-secondary": theme.secondary,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        {links.map((l, idx) => (
          <a
            key={`${l.href}_${idx}`}
            href={l.href}
            className="wwg-tip inline-flex items-center gap-2 border-4 border-black bg-white/40 px-2 py-1"
            data-tip={`Icon link: ${l.label}. Destination: ${l.href}. Reliability: low.`}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noreferrer" : undefined}
          >
            <BadIcon name={l.name} theme={theme} size={size ?? 22} title={l.label} />
            <span className="text-xs font-black underline">{l.label}</span>
          </a>
        ))}
      </div>
      <div className="text-[10px] italic opacity-90">Icons are for trust. Trust is optional.</div>
    </div>
  );
}

