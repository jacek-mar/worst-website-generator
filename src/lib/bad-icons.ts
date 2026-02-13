export type BadIconName = "skull" | "spark" | "maze" | "warning";

export type BadIconTheme = {
  primary: string;
  secondary: string;
};

export type BadIconLink = {
  name: BadIconName;
  label: string;
  href: string;
};

type IconDef = {
  viewBox: string;
  // Using two-tone fills so we can intentionally clash while still "matching" a palette.
  primaryPaths: string[];
  secondaryPaths: string[];
};

export const BAD_ICON_DEFS: Record<BadIconName, IconDef> = {
  skull: {
    viewBox: "0 0 24 24",
    primaryPaths: [
      "M12 2c-4.7 0-8.5 3.8-8.5 8.5 0 3.6 2.2 6.7 5.4 7.9V21c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-1h2v1c0 .6.4 1 1 1h1c.6 0 1-.4 1-1v-2.6c3.2-1.2 5.4-4.3 5.4-7.9C20.5 5.8 16.7 2 12 2Z",
    ],
    secondaryPaths: [
      "M9.2 12.3c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6Zm5.6 0c-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6 1.6.7 1.6 1.6-.7 1.6-1.6 1.6ZM10 16.2c.6-.7 1.4-1 2-1s1.4.3 2 1c.3.3.3.8 0 1.1-.3.3-.8.3-1.1 0-.2-.2-.6-.4-.9-.4s-.7.1-.9.4c-.3.3-.8.3-1.1 0-.3-.3-.3-.8 0-1.1Z",
    ],
  },
  spark: {
    viewBox: "0 0 24 24",
    primaryPaths: [
      "M12 2l1.4 5.5L19 9l-5.6 1.5L12 16l-1.4-5.5L5 9l5.6-1.5L12 2Z",
    ],
    secondaryPaths: [
      "M4 14l.8 3.1L8 18l-3.2.9L4 22l-.8-3.1L0 18l3.2-.9L4 14Zm18-3l.7 2.6L25 14l-2.3.7L22 17l-.7-2.6L19 14l2.3-.7L22 11Z",
    ],
  },
  maze: {
    viewBox: "0 0 24 24",
    primaryPaths: [
      "M3 3h18v4h-2V5H5v14h14v-2h2v4H3V3Z",
      "M8 8h8v2h-6v6h6v2H8V8Z",
    ],
    secondaryPaths: [
      "M12 10h4v4h-2v-2h-2v-2Z",
      "M6 6h2v2H6V6Zm10 10h2v2h-2v-2Z",
    ],
  },
  warning: {
    viewBox: "0 0 24 24",
    primaryPaths: [
      "M12 2 1 21h22L12 2Z",
    ],
    secondaryPaths: [
      "M12 8c.6 0 1 .4 1 1v6c0 .6-.4 1-1 1s-1-.4-1-1V9c0-.6.4-1 1-1Zm0 12.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z",
    ],
  },
};

export function badIconSvgString(
  name: BadIconName,
  theme: BadIconTheme,
  opts?: { size?: number; title?: string },
) {
  const def = BAD_ICON_DEFS[name];
  const size = opts?.size ?? 22;
  const title = (opts?.title ?? name).replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const primary = theme.primary;
  const secondary = theme.secondary;

  return `
<svg class="wwg-icon" width="${size}" height="${size}" viewBox="${def.viewBox}" role="img" aria-label="${title}" xmlns="http://www.w3.org/2000/svg">
  <title>${title}</title>
  ${def.primaryPaths.map((d) => `<path d="${d}" fill="${primary}" />`).join("")}
  ${def.secondaryPaths.map((d) => `<path d="${d}" fill="${secondary}" />`).join("")}
</svg>`.trim();
}

