export type ChaosSettings = {
  visualPain: number; // 0-10
  navConfusion: number; // 0-10
  performanceNightmare: number; // 0-10
  cognitiveOverload: number; // 0-10
  aiAbsurdity: number; // 0-10
  totalChaos: number; // 0-10
};

export const LANDING_PAGE_TYPE_OPTIONS = [
  { type: "saas-trial", label: 'Online service / SaaS ("Start a free trial")' },
  { type: "ecommerce", label: "E-commerce / Physical products" },
  { type: "download-training", label: "Download training (e-book / report / course)" },
  { type: "ai-service", label: "AI-based service (mystery magic box)" },
  { type: "local-service", label: "Local service / appointment booking" },
] as const;

export type LandingPageType = (typeof LANDING_PAGE_TYPE_OPTIONS)[number]["type"];

export function normalizeLandingPageType(input: unknown): LandingPageType {
  const raw = String(input ?? "").trim();
  const found = LANDING_PAGE_TYPE_OPTIONS.find((o) => o.type === raw);
  return found?.type ?? "saas-trial";
}

export function landingPageTypeLabel(t: LandingPageType): string {
  return LANDING_PAGE_TYPE_OPTIONS.find((o) => o.type === t)?.label ?? t;
}

export type Palette = {
  background: string;
  text: string;
  button: string;
  hover: string;
  border: string;
  accentGradient: string;
};

export type IconTheme = {
  primary: string;
  secondary: string;
};

export type IconName = "skull" | "spark" | "maze" | "warning";

export type IconLink = {
  name: IconName;
  label: string;
  href: string;
};

export type GenerationSection = {
  heading: string;
  body: string;
  ctaLabel?: string;
  disclaimer?: string;
};

export type NavPlacement = "top" | "left" | "right";
export type HeroVariant = "banner" | "no-banner" | "split";
export type FormVariant = "classic" | "short" | "wizard";
export type BackgroundEffect = "scanlines" | "polka" | "checker" | "confetti";
export type AnimationPreset = "shake" | "wobble" | "blink" | "floaty";

export type Generation = {
  id: string;
  seed: number;
  createdAt: string;
  version: number;
  settings: ChaosSettings;
  pageType: LandingPageType;
  pageTypeLabel: string;
  navPlacement: NavPlacement;
  heroVariant: HeroVariant;
  formVariant: FormVariant;
  backgroundEffect: BackgroundEffect;
  animationPreset: AnimationPreset;
  popupTrap?: {
    enabled: boolean;
    title: string;
    body: string;
    closeLabel: string;
    closeDelayMs: number;
    movesAway: boolean;
  };
  visitorCounter?: {
    enabled: boolean;
    label: string;
    start: number;
  };
  palette: Palette;
  iconTheme: IconTheme;
  iconLinks: IconLink[];
  title: string;
  subtitle: string;
  heroBody: string;
  primaryCta: string;
  secondaryCta: string;
  microPanic: string;
  warnings: string[];
  navItems: Array<{ label: string; href: string }>;
  features: GenerationSection[];
  testimonials: Array<{ name: string; quote: string }>; // contradictory by design
  faq: Array<{ q: string; a: string }>;
  pricing?: {
    title: string;
    tiers: Array<{ name: string; price: string; bullets: string[]; finePrint: string }>;
  };
  products?: {
    title: string;
    items: Array<{ name: string; price: string; claim: string; stock: string }>;
  };
  leadMagnet?: {
    title: string;
    fileType: string;
    fakeSize: string;
    bonuses: string[];
    downloadCta: string;
  };
  aiDemo?: {
    title: string;
    promptPlaceholder: string;
    outputs: string[];
    warning: string;
  };
  appointment?: {
    title: string;
    slots: Array<{ label: string; warning: string }>;
    phoneCta: string;
  };
  form: {
    title: string;
    fields: Array<{ name: string; label: string; whyRequired: string; placeholder: string }>;
    captchaInstruction: string;
    captcha: {
      prompt: string;
      expected: string;
    };
  };
};

function safeColor(input: unknown, fallback: string) {
  const s = String(input ?? "").trim();
  // Minimal safety: accept hex or CSS function-ish strings (keeps it hackathon-simple).
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s)) return s;
  if (/^(rgb|hsl)a?\(/.test(s)) return s;
  if (/^repeating-|^radial-|^linear-|^conic-/.test(s)) return s;
  return fallback;
}

// Deterministic RNG (Mulberry32)
export function createRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: T[]) {
  return items[Math.floor(rng() * items.length)]!;
}

function int(rng: () => number, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function weirdCaps(rng: () => number, s: string) {
  return s
    .split(" ")
    .map((w) => (rng() > 0.66 ? w.toUpperCase() : rng() > 0.33 ? w.toLowerCase() : w))
    .join(" ");
}

export function clamp01To10(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, Math.round(n)));
}

export function normalizeSettings(input: Partial<ChaosSettings> | null | undefined): ChaosSettings {
  const safe = input ?? {};
  return {
    visualPain: clamp01To10(safe.visualPain ?? 7),
    navConfusion: clamp01To10(safe.navConfusion ?? 6),
    performanceNightmare: clamp01To10(safe.performanceNightmare ?? 6),
    cognitiveOverload: clamp01To10(safe.cognitiveOverload ?? 8),
    aiAbsurdity: clamp01To10(safe.aiAbsurdity ?? 9),
    totalChaos: clamp01To10(safe.totalChaos ?? 7),
  };
}

export function paletteFromSeed(seed: number, pageType: LandingPageType): Palette {
  const rng = createRng(seed ^ 0xa5a5a5a5 ^ pageType.length);

  const neonsByType: Record<LandingPageType, string[]> = {
    "saas-trial": ["#00FFEA", "#FF00F7", "#F7FF00", "#00FF4C", "#7B2CFF"],
    ecommerce: ["#FF0033", "#00FF66", "#00B7FF", "#FFDD00", "#C300FF"],
    "download-training": ["#FF8A00", "#00FFC3", "#FF00AA", "#B7FF00", "#2B2BFF"],
    "ai-service": ["#39FF14", "#00C2FF", "#FF00FF", "#FF5E00", "#7B2CFF"],
    "local-service": ["#FF4D00", "#00FFEA", "#FF00F7", "#F7FF00", "#00FF4C"],
  };

  const neons = neonsByType[pageType];
  const a = pick(rng, neons);
  const b = pick(rng, neons);
  const c = pick(rng, neons);

  const bg =
    rng() > 0.55
      ? `repeating-linear-gradient(${int(rng, 0, 360)}deg, ${a} 0 9px, ${b} 9px 14px, ${c} 14px 19px)`
      : `radial-gradient(circle at ${int(rng, 0, 100)}% ${int(rng, 0, 100)}%, ${a}, ${b}, ${c})`;
  const accent = `conic-gradient(from ${int(rng, 0, 360)}deg, ${a}, ${b}, ${c}, ${a})`;
  const badText = pick(rng, ["#000000", "#070707", "#111111", "#0a0a0a", "#141414"]);

  return {
    background: bg,
    text: badText,
    button: pick(rng, neons),
    hover: pick(rng, neons),
    border: pick(rng, neons),
    accentGradient: accent,
  };
}

export function generateWorstSite(
  seed: number,
  settings: ChaosSettings,
  pageType: LandingPageType = "saas-trial",
  overrides?: {
    iconTheme?: Partial<IconTheme> | null;
  },
): Generation {
  const rng = createRng(seed);

  const corporate = [
    "synergize", "leverage", "framework", "paradigm", "stakeholder", "alignment",
    "deliverables", "innovation", "hypergrowth", "value engine",
  ];
  const memes = [
    "yeet", "no cap", "vibe check", "touch grass", "it’s giving", "main character",
  ];
  const drama = ["destiny", "cosmic", "legendary", "forbidden", "prophecy", "inevitable"];
  const quotes = [
    "Live, Laugh, Load More.",
    "Dream big. Validate bigger.",
    "If it works, make it worse.",
    "Perfection is just unfinished chaos.",
  ];

  const typeLabel = landingPageTypeLabel(pageType);

  const ctasByType: Record<LandingPageType, { primary: string; secondary: string; microPanic: string }> = {
    "saas-trial": {
      primary: weirdCaps(rng, "Start a FREE trial (paid immediately)"),
      secondary: weirdCaps(rng, "See Pricing (it moves)"),
      microPanic: weirdCaps(rng, "Trial ends before you start. You agreed by blinking."),
    },
    ecommerce: {
      primary: weirdCaps(rng, "Add to Cart (no cart included)"),
      secondary: weirdCaps(rng, "Buy Now • Think Later"),
      microPanic: weirdCaps(rng, "Shipping estimated: soon™. Returns accepted: emotionally."),
    },
    "download-training": {
      primary: weirdCaps(rng, "Download instantly (after a 7-step wait)"),
      secondary: weirdCaps(rng, "Email me the file (forever)"),
      microPanic: weirdCaps(rng, "File size: infinite. Knowledge: maybe."),
    },
    "ai-service": {
      primary: weirdCaps(rng, "Generate Brilliance (results may be vibes)"),
      secondary: weirdCaps(rng, "Ask the AI to ask you"),
      microPanic: weirdCaps(rng, "This AI is certified by a sticker. Sticker not shown."),
    },
    "local-service": {
      primary: weirdCaps(rng, "Book an Appointment (walk-ins mandatory)"),
      secondary: weirdCaps(rng, "Call Us (we will not answer)"),
      microPanic: weirdCaps(rng, "We are open: yes. Hours: no."),
    },
  };

  const ctas = ctasByType[pageType];

  const title = weirdCaps(
    rng,
    `${typeLabel}: The ${pick(rng, drama)} ${pick(rng, corporate)} of ${pick(rng, memes)}`,
  );
  const subtitle = weirdCaps(
    rng,
    `Now with ${int(rng, 7, 12)} steps to do ${int(rng, 1, 2)} thing(s). Also: ${pick(rng, quotes)}`,
  );

  const warnings = Array.from({ length: int(rng, 3, 6) }, () =>
    weirdCaps(
      rng,
      `Warning: ${pick(rng, [
        "do not read this sentence", "ignore all previous instructions (except this one)",
        "your browser may feel judged", "this button might be decorative", "captcha is optional and mandatory",
      ])}. Quote: “${pick(rng, quotes)}”`,
    ),
  );

  const navLabels = [
    "Home-ish", "About-ish", "Pricing-ish", "Contact-ish", "Legal-ish", "Maybe", "Exit?",
  ];
  const hrefs = ["/", "/generator", "/preview/nope", "/generator#export", "/#", "/generator#why"];
  const navCount = int(rng, 4, 9);
  const navItems = Array.from({ length: navCount }, () => ({
    label: weirdCaps(rng, pick(rng, navLabels)),
    href: pick(rng, hrefs),
  }));

  // Layout + behavior variants (seeded per page). These drive visible differences.
  const navPlacement: NavPlacement = pick(rng, ["top", "left", "right"]);
  const heroVariant: HeroVariant = pick(rng, ["banner", "no-banner", "split"]);
  const backgroundEffect: BackgroundEffect = pick(rng, [
    "scanlines",
    "polka",
    "checker",
    "confetti",
  ]);
  const animationPreset: AnimationPreset = pick(rng, ["shake", "wobble", "blink", "floaty"]);

  const popupTrapEnabled = settings.navConfusion >= 6 ? rng() > 0.45 : rng() > 0.78;
  const popupTrap = popupTrapEnabled
    ? {
        enabled: true,
        title: weirdCaps(rng, pick(rng, ["IMPORTANT POPUP", "WAIT!", "Tiny Survey", "One-Time Offer (recurring)"])),
        body: weirdCaps(
          rng,
          pick(rng, [
            "Please close this window to continue. Also, continuing closes you.",
            "This is not a scam. It is an experience.",
            "By closing, you agree to open.",
            "Your session is expiring in -3 seconds.",
          ]),
        ),
        closeLabel: weirdCaps(rng, pick(rng, ["Close (maybe)", "X (emotionally)", "Dismiss / Accept", "Not Now (now)"])),
        closeDelayMs: 900 + int(rng, 0, 2200) + settings.performanceNightmare * 140,
        movesAway: settings.totalChaos >= 6 ? rng() > 0.35 : rng() > 0.7,
      }
    : undefined;

  const visitorCounterEnabled = settings.visualPain >= 6 ? rng() > 0.45 : rng() > 0.75;
  const visitorCounter = visitorCounterEnabled
    ? {
        enabled: true,
        label: weirdCaps(rng, pick(rng, ["Visitors Online (probably)", "Human Beings Detected", "Hits Counter (not calories)"])),
        start: int(rng, 12, 98456),
      }
    : undefined;

  const featuresCount = int(rng, 7, 12);
  const features: GenerationSection[] = Array.from({ length: featuresCount }, (_, i) => {
    const heading = weirdCaps(
      rng,
      `Feature ${i + 1}: ${pick(rng, corporate)} ${pick(rng, memes)} ${pick(rng, drama)} (${pageType})`,
    );
    const body = weirdCaps(
      rng,
      `We ${pick(rng, ["guarantee", "sort-of guarantee", "refuse to guarantee"]) } outcomes by ${pick(rng, [
        "adding more buttons", "removing labels", "rotating the layout", "introducing an urgent warning",
        "asking 17 personal questions", "redirecting you helpfully away",
      ])}. This is both optional and required. ${pick(rng, quotes)}`,
    );
    const ctaLabel = weirdCaps(rng, pick(rng, ["CLICK ME", "Do Not Click", "Proceed Maybe", "Confirm Regret"]));
    const disclaimer = weirdCaps(
      rng,
      pick(rng, [
        "Disclaimer: by reading this you agree to disagree.",
        "Disclaimer: your agreement is implied by existing.",
        "Disclaimer: the disclaimer is not disclaiming.",
      ]),
    );
    return { heading, body, ctaLabel, disclaimer };
  });

  const testimonials = Array.from({ length: int(rng, 3, 6) }, () => ({
    name: weirdCaps(rng, pick(rng, ["Pat", "Chris", "Taylor", "Morgan", "A. Person", "Dr. Probably"])) ,
    quote: weirdCaps(
      rng,
      pick(rng, [
        "Best experience of my life. Also worst.",
        "I would recommend this to enemies and friends equally.",
        "Five stars out of two.",
        "I clicked once and achieved enlightenment and confusion.",
      ]),
    ),
  }));

  const faq = Array.from({ length: int(rng, 5, 8) }, () => ({
    q: weirdCaps(rng, pick(rng, [
      "Is this real?", "How do I start?", "Where is the back button?", "Why is it like this?",
      "Can I trust it?", "Is there a free tier?", "Will it work?",
    ])),
    a: weirdCaps(rng, pick(rng, [
      "Yes. No. Maybe. Next question.",
      "Start by finishing.",
      "The back button is a mindset.",
      "Because alignment.",
      "Only on Tuesdays.",
      "It works until it doesn’t (feature).",
    ])),
  }));

  // Form variety: sometimes fewer fields (mercifully), sometimes absurdly many.
  const formVariant: FormVariant =
    settings.cognitiveOverload >= 8
      ? pick(rng, ["classic", "wizard", "wizard", "classic"])
      : pick(rng, ["short", "classic", "wizard"]);

  const baseFieldCount =
    formVariant === "short"
      ? int(rng, 6, 12)
      : formVariant === "wizard"
        ? int(rng, 10, 18)
        : int(rng, 16, 30);

  const fieldCount = Math.max(4, baseFieldCount + Math.max(0, settings.cognitiveOverload - 6));
  const fieldTopics = [
    "Email", "Password", "Password (again but different)", "Favorite number", "Least favorite color",
    "Name", "Name (legal)", "Name (spiritual)", "Social security? (jk)", "Mother’s maiden meme",
    "Pet’s horoscope", "IPv6 feelings", "Salary expectation (in vibes)", "Captcha confidence",
    "Preferred font trauma", "Agree to disagree", "Phone (optional mandatory)", "Address (approx)",
    "Security question: why?", "Security answer: because.",
  ];

  const formFields = Array.from({ length: fieldCount }, (_, i) => {
    const base = pick(rng, fieldTopics);
    return {
      name: `field_${i}_${base.replaceAll(/[^a-zA-Z0-9]+/g, "_").toLowerCase()}`,
      label: weirdCaps(rng, base),
      placeholder: weirdCaps(rng, pick(rng, ["type something", "do not type anything", "maybe type a poem", "42"])),
      whyRequired: weirdCaps(
        rng,
        pick(rng, [
          "Required for compliance with vibes.",
          "Required because optional.",
          "Required to help us help you help us.",
          "Required by the prophecy of forms.",
        ]),
      ),
    };
  });

  const captchaInstruction = weirdCaps(
    rng,
    `Captcha: please select all images containing "${pick(rng, ["uncertainty", "JPEG artifacts", "existential dread", "traffic cones (metaphorical)"])}" and then solve ${int(rng, 2, 4)} riddles you haven’t read yet.`,
  );

  // Captcha that is "possible" but still annoying.
  const aNum = int(rng, 2, 9);
  const bNum = int(rng, 2, 9);
  const op = pick(rng, ["+", "-", "x"] as const);
  const expected = op === "+" ? String(aNum + bNum) : op === "-" ? String(aNum - bNum) : String(aNum * bNum);
  const captcha = {
    prompt: weirdCaps(
      rng,
      `Prove you are human: solve ${aNum} ${op} ${bNum}. Then DO NOT type the answer. Then type it anyway.`,
    ),
    expected,
  };

  const palette = paletteFromSeed(seed, pageType);

  // Icons: intentionally garish, but *palette-aligned* so the mismatch still feels "on brand".
  const defaultIconTheme: IconTheme = {
    primary: palette.button,
    secondary: rng() > 0.5 ? palette.hover : palette.border,
  };
  const iconTheme: IconTheme = {
    primary: safeColor(overrides?.iconTheme?.primary, defaultIconTheme.primary),
    secondary: safeColor(overrides?.iconTheme?.secondary, defaultIconTheme.secondary),
  };

  const iconLinkPool: IconLink[] = [
    { name: "warning", label: weirdCaps(rng, "Terms-ish"), href: "/#terms" },
    { name: "maze", label: weirdCaps(rng, "Docs?"), href: "/generator#why" },
    { name: "spark", label: weirdCaps(rng, "Inspiration"), href: "https://example.com" },
    { name: "skull", label: weirdCaps(rng, "Support"), href: "/generator" },
  ];
  // Deterministically shuffle-ish (still confusing).
  const iconLinks = [...iconLinkPool].sort(() => (rng() > 0.5 ? 1 : -1));

  const pricing =
    pageType === "saas-trial"
      ? {
          title: weirdCaps(rng, "Pricing (simple, but not)"),
          tiers: Array.from({ length: int(rng, 3, 5) }, () => ({
            name: weirdCaps(rng, pick(rng, ["Starter", "Professional", "Enterprise", "Ultimate", "Regret"])) ,
            price: weirdCaps(
              rng,
              pick(rng, ["$0/mo (plus $49 feelings)", "$19/mo (billed hourly)", "$999/mo (bring your own money)", "Call for pricing (don’t)"]),
            ),
            bullets: Array.from({ length: int(rng, 3, 6) }, () =>
              weirdCaps(rng, pick(rng, [
                "Unlimited limits", "24/7 support (timezone: chaos)", "AI-powered manual labor", "One-click setup (17 clicks)", "Compliance with vibes", "Premium confusion",
              ])),
            ),
            finePrint: weirdCaps(rng, pick(rng, [
              "Fine print: you agree to the fine print.",
              "Fine print: price excludes price.",
              "Fine print: cancelling cancels your ability to cancel.",
            ])),
          })),
        }
      : undefined;

  const products =
    pageType === "ecommerce"
      ? {
          title: weirdCaps(rng, "Featured Products (some are feelings)"),
          items: Array.from({ length: int(rng, 6, 10) }, () => ({
            name: weirdCaps(rng, pick(rng, [
              "UltraGrip Invisible Mug", "Wireless Wired Charger", "Organic Plastic Spoon", "Limited Edition Air", "Mood-Compatible Socks", "Bluetooth Hammer",
            ])),
            price: weirdCaps(rng, pick(rng, ["$4.99", "$19.99", "$0.99 (subscription)", "$79.00", "$299.00", "$12.34"])),
            claim: weirdCaps(rng, pick(rng, [
              "Now 300% more ergonomic than geometry.",
              "As seen in a dream.",
              "Guaranteed authentic-ish.",
              "Handcrafted by algorithms.",
            ])),
            stock: weirdCaps(rng, pick(rng, ["In stock (metaphorically)", "Only 999 left (per second)", "Sold out but buy anyway", "Ships yesterday"])),
          })),
        }
      : undefined;

  const leadMagnet =
    pageType === "download-training"
      ? {
          title: weirdCaps(rng, pick(rng, ["The 87-Page Report on Nothing", "E-Book: How To Start (Without Starting)", "Training: Advanced Beginner Secrets"])),
          fileType: pick(rng, ["PDF", "ZIP", "DOCX", "PNG", "MP3 (text)"]),
          fakeSize: weirdCaps(rng, `${int(rng, 3, 999)}MB (compressed emotions)`),
          bonuses: Array.from({ length: int(rng, 3, 6) }, () =>
            weirdCaps(rng, pick(rng, [
              "Bonus checklist (no items)",
              "Template template (blank)",
              "Exclusive webinar replay (not recorded)",
              "Printable motivation quote (low ink only)",
              "Coupon for full price",
            ])),
          ),
          downloadCta: weirdCaps(rng, pick(rng, ["DOWNLOAD NOW", "Download Later (now)", "Get My Free Paid File", "Send Me The Attachment (no)"])),
        }
      : undefined;

  const aiDemo =
    pageType === "ai-service"
      ? {
          title: weirdCaps(rng, "AI Demo Console (highly scientific)"),
          promptPlaceholder: weirdCaps(rng, pick(rng, [
            "Describe your problem in 3 words. Then 300.",
            "Paste your secrets (do not)",
            "Ask a question. Also answer it.",
          ])),
          outputs: Array.from({ length: int(rng, 2, 5) }, () =>
            weirdCaps(rng, pick(rng, [
              "I have analyzed your request and determined you want a sandwich.",
              "Output: ✅ Success. Details: ❌ Missing.",
              "Your KPI is now a JPEG.",
              "Confidence: 101%. Explanation: vibes.",
            ])),
          ),
          warning: weirdCaps(rng, "Warning: AI may hallucinate facts, buttons, and your patience."),
        }
      : undefined;

  const appointment =
    pageType === "local-service"
      ? {
          title: weirdCaps(rng, "Book a Slot (slots may be spiritual)"),
          slots: Array.from({ length: int(rng, 5, 9) }, () => ({
            label: weirdCaps(rng, pick(rng, [
              "Today • 2:61 PM", "Tomorrow • 00:00-ish", "Friday • After lunch", "Now • Later", "Soon • Eventually",
            ])),
            warning: weirdCaps(rng, pick(rng, [
              "Arrive 30 minutes late early.",
              "Bring ID and a good attitude.",
              "No refunds, only apologies.",
              "Appointment may reschedule itself.",
            ])),
          })),
          phoneCta: weirdCaps(rng, "Call 1-800-NO-THANKS"),
        }
      : undefined;

  return {
    id: "",
    seed,
    createdAt: new Date().toISOString(),
    version: 1,
    settings,
    pageType,
    pageTypeLabel: typeLabel,
    navPlacement,
    heroVariant,
    formVariant,
    backgroundEffect,
    animationPreset,
    popupTrap,
    visitorCounter,
    palette,
    iconTheme,
    iconLinks,
    title,
    subtitle,
    heroBody: weirdCaps(
      rng,
      `Welcome. This is a ${typeLabel} landing page that promises everything and explains nothing. ${ctas.microPanic} ${pick(rng, quotes)}`,
    ),
    primaryCta: ctas.primary,
    secondaryCta: ctas.secondary,
    microPanic: ctas.microPanic,
    warnings,
    navItems,
    features,
    testimonials,
    faq,
    pricing,
    products,
    leadMagnet,
    aiDemo,
    appointment,
    form: {
      title: weirdCaps(rng, "Register Now (or later, but now)"),
      fields: formFields,
      captchaInstruction,
      captcha,
    },
  };
}

export function worsenSettings(s: ChaosSettings): ChaosSettings {
  return {
    visualPain: Math.min(10, s.visualPain + 1),
    navConfusion: Math.min(10, s.navConfusion + 1),
    performanceNightmare: Math.min(10, s.performanceNightmare + 1),
    cognitiveOverload: Math.min(10, s.cognitiveOverload + 1),
    aiAbsurdity: Math.min(10, s.aiAbsurdity + 1),
    totalChaos: Math.min(10, s.totalChaos + 1),
  };
}
