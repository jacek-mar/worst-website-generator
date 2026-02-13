export type ChaosSettings = {
  visualPain: number; // 0-10
  navConfusion: number; // 0-10
  performanceNightmare: number; // 0-10
  cognitiveOverload: number; // 0-10
  aiAbsurdity: number; // 0-10
  totalChaos: number; // 0-10
};

export type Palette = {
  background: string;
  text: string;
  button: string;
  hover: string;
  border: string;
  accentGradient: string;
};

export type GenerationSection = {
  heading: string;
  body: string;
  ctaLabel?: string;
  disclaimer?: string;
};

export type Generation = {
  id: string;
  seed: number;
  createdAt: string;
  version: number;
  settings: ChaosSettings;
  palette: Palette;
  title: string;
  subtitle: string;
  heroBody: string;
  warnings: string[];
  navItems: Array<{ label: string; href: string }>;
  features: GenerationSection[];
  testimonials: Array<{ name: string; quote: string }>; // contradictory by design
  faq: Array<{ q: string; a: string }>;
  form: {
    title: string;
    fields: Array<{ name: string; label: string; whyRequired: string; placeholder: string }>;
    captchaInstruction: string;
  };
};

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

export function paletteFromSeed(seed: number): Palette {
  const rng = createRng(seed ^ 0xa5a5a5a5);
  const neons = ["#00FFEA", "#FF00F7", "#F7FF00", "#00FF4C", "#FF6B00", "#7B2CFF"];
  const bg = `linear-gradient(${int(rng, 0, 360)}deg, ${pick(rng, neons)}, ${pick(rng, neons)})`;
  const accent = `linear-gradient(${int(rng, 0, 360)}deg, ${pick(rng, neons)}, ${pick(rng, neons)}, ${pick(rng, neons)})`;
  return {
    background: bg,
    text: pick(rng, ["#000000", "#101010", "#1b1b1b", "#0a0a0a"]),
    button: pick(rng, neons),
    hover: pick(rng, neons),
    border: pick(rng, neons),
    accentGradient: accent,
  };
}

export function generateWorstSite(seed: number, settings: ChaosSettings): Generation {
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

  const title = weirdCaps(
    rng,
    `The ${pick(rng, drama)} ${pick(rng, corporate)} of ${pick(rng, memes)} websites`,
  );
  const subtitle = weirdCaps(
    rng,
    `Now with ${int(rng, 7, 12)} steps to do ${int(rng, 1, 2)} thing(s).`,
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

  const featuresCount = int(rng, 7, 12);
  const features: GenerationSection[] = Array.from({ length: featuresCount }, (_, i) => {
    const heading = weirdCaps(
      rng,
      `Feature ${i + 1}: ${pick(rng, corporate)} ${pick(rng, memes)} ${pick(rng, drama)}`,
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

  const fieldCount = 20 + Math.max(0, settings.cognitiveOverload - 5);
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

  const palette = paletteFromSeed(seed);

  return {
    id: "",
    seed,
    createdAt: new Date().toISOString(),
    version: 1,
    settings,
    palette,
    title,
    subtitle,
    heroBody: weirdCaps(
      rng,
      `Welcome. This is a landing page that promises everything and explains nothing. Your journey begins after you finish it. ${pick(rng, quotes)}`,
    ),
    warnings,
    navItems,
    features,
    testimonials,
    faq,
    form: {
      title: weirdCaps(rng, "Register Now (or later, but now)"),
      fields: formFields,
      captchaInstruction,
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

