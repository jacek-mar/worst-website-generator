import type { BadIconName, BadIconTheme } from "@/lib/bad-icons";
import { BAD_ICON_DEFS } from "@/lib/bad-icons";

export function BadIcon({
  name,
  theme,
  size = 22,
  title,
}: {
  name: BadIconName;
  theme: BadIconTheme;
  size?: number;
  title?: string;
}) {
  const def = BAD_ICON_DEFS[name];
  return (
    <svg
      className="wwg-icon"
      width={size}
      height={size}
      viewBox={def.viewBox}
      role="img"
      aria-label={title ?? name}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title ?? name}</title>
      {def.primaryPaths.map((d, idx) => (
        <path key={`p_${idx}`} d={d} fill={theme.primary} />
      ))}
      {def.secondaryPaths.map((d, idx) => (
        <path key={`s_${idx}`} d={d} fill={theme.secondary} />
      ))}
    </svg>
  );
}

