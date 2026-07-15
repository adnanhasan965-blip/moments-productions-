import Image from "next/image";

const COLORS = [
  {
    name: "Black",
    role: "PRIMARY · GROUND",
    line: "The room before the picture.",
    hex: "#000000",
    rgb: "0 · 0 · 0",
    cmyk: "0 · 0 · 0 · 100",
    pms: "Black 6 C",
    swatch: "bg-[var(--brand-black)]",
    text: "text-[var(--brand-cream)]",
  },
  {
    name: "Signal",
    role: "ACCENT · SIGNAL",
    line: "The recording light.",
    hex: "#E50914",
    rgb: "229 · 9 · 20",
    cmyk: "0 · 96 · 91 · 10",
    pms: "485 C",
    swatch: "bg-[var(--brand-signal)]",
    text: "text-[var(--brand-cream)]",
  },
  {
    name: "Cream",
    role: "TYPE · LIGHT",
    line: "The projected word.",
    hex: "#F5F0E8",
    rgb: "245 · 240 · 232",
    cmyk: "3 · 4 · 9 · 0",
    pms: "7527 C",
    swatch: "bg-[var(--brand-cream)] border",
    text: "text-[var(--brand-black)]",
  },
];

function Viewfinder({ children }: { children: React.ReactNode }) {
  return (
    <span className="viewfinder inline-block px-6 py-4">
      <span className="vf absolute inset-0" />
      {children}
    </span>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 px-6 py-12">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-muted-foreground">
          MOMENTS PRODUCTIONS · BRAND SYSTEM · APRIL 2026
        </p>
        <h1 className="text-5xl">The brand is the title card.</h1>
        <p className="font-[family-name:var(--font-editorial)] italic text-lg text-muted-foreground">
          No icon. No flare. Just the word appearing on a black screen — the
          way every film begins.
        </p>
      </header>

      {/* ============ LOGO ============ */}
      <section className="space-y-6">
        <h2 className="text-3xl">01 — Logo</h2>
        <p className="text-sm text-muted-foreground">
          One mark · four contexts. The wordmark always stands alone — never
          wrapped in brackets, never locked to an icon.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <figure className="border">
            <div className="flex aspect-video items-center justify-center bg-[var(--brand-cream)] p-8">
              <Image src="/brand/logo.png" alt="Moments Productions — on cream" width={1200} height={436} className="h-auto w-full max-w-56" />
            </div>
            <figcaption className="border-t p-3 text-xs tracking-widest">
              PRIMARY · ON CREAM
            </figcaption>
          </figure>
          <figure className="border">
            <div className="flex aspect-video items-center justify-center bg-[var(--brand-black)] p-8">
              <Image src="/brand/logo-dark.png" alt="Moments Productions — on black" width={1200} height={436} className="h-auto w-full max-w-56" />
            </div>
            <figcaption className="border-t p-3 text-xs tracking-widest">
              REVERSE · ON BLACK
            </figcaption>
          </figure>
          <figure className="border">
            <div className="flex aspect-video items-center justify-center bg-[var(--brand-signal)] p-8">
              <Image src="/brand/logo-dark.png" alt="Moments Productions — on signal" width={1200} height={436} className="h-auto w-full max-w-56" />
            </div>
            <figcaption className="border-t p-3 text-xs tracking-widest">
              STATEMENT · ON SIGNAL
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ============ COLOR ============ */}
      <section className="space-y-6">
        <h2 className="text-3xl">02 — Color</h2>
        <p className="text-sm text-muted-foreground">
          Three values. Warm · on paper. No greys · no tints.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {COLORS.map((c) => (
            <div key={c.name} className="border">
              <div className={`${c.swatch} ${c.text} flex aspect-square flex-col justify-between p-4`}>
                <span className="text-xs tracking-[0.25em]">{c.role}</span>
                <span className="font-display text-4xl">{c.name}</span>
              </div>
              <dl className="space-y-1 border-t p-4 text-xs">
                <div className="flex justify-between"><dt className="text-muted-foreground">HEX</dt><dd>{c.hex}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">RGB</dt><dd>{c.rgb}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">CMYK</dt><dd>{c.cmyk}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">PMS</dt><dd>{c.pms}</dd></div>
                <p className="pt-2 font-[family-name:var(--font-editorial)] italic text-muted-foreground">{c.line}</p>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TYPOGRAPHY ============ */}
      <section className="space-y-6">
        <h2 className="text-3xl">03 — Typography</h2>
        <p className="text-sm text-muted-foreground">Three voices.</p>
        <div className="divide-y border">
          <div className="grid gap-2 p-6 sm:grid-cols-[1fr_2fr] sm:items-center">
            <div className="text-xs tracking-widest text-muted-foreground">
              DISPLAY · WORDMARK
              <br />
              BEBAS NEUE · REGULAR
            </div>
            <div className="font-display text-6xl leading-none">Moments</div>
          </div>
          <div className="grid gap-2 p-6 sm:grid-cols-[1fr_2fr] sm:items-center">
            <div className="text-xs tracking-widest text-muted-foreground">
              EDITORIAL · NAMES + TAGLINE
              <br />
              INSTRUMENT SERIF · ITALIC
            </div>
            <div className="font-[family-name:var(--font-editorial)] italic text-4xl">
              a series of moments
            </div>
          </div>
          <div className="grid gap-2 p-6 sm:grid-cols-[1fr_2fr] sm:items-center">
            <div className="text-xs tracking-widest text-muted-foreground">
              TECHNICAL · UI + DATA
              <br />
              JETBRAINS MONO
            </div>
            <div className="text-xl">
              CALL 06:30 · KWD 1,250.500 · SHOT 04/12
            </div>
          </div>
          <div className="grid gap-2 p-6 sm:grid-cols-[1fr_2fr] sm:items-center">
            <div className="text-xs tracking-widest text-muted-foreground">
              ARABIC · RTL MODE
              <br />
              JETBRAINS MONO · ARABIC SCRIPT FALLS TO IBM PLEX SANS ARABIC
            </div>
            <div
              dir="rtl"
              className="font-[family-name:var(--font-jetbrains),var(--font-arabic)] text-3xl"
            >
              سلسلة من اللحظات · KWD 1,250.500
            </div>
          </div>
        </div>
        {/* Type scale */}
        <div className="divide-y border">
          {[
            ["H1 · 48px", "text-5xl"],
            ["H2 · 30px", "text-3xl"],
            ["H3 · 24px", "text-2xl"],
          ].map(([label, cls]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 p-4">
              <span className={`${cls} font-display`}>Production days</span>
              <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-6 p-4">
            <span className="text-base">Body · JetBrains Mono 16px — costs, schedules, call times.</span>
            <span className="shrink-0 text-xs text-muted-foreground">BODY · 16PX</span>
          </div>
        </div>
      </section>

      {/* ============ FRAMING ============ */}
      <section className="space-y-6">
        <h2 className="text-3xl">04 — Framing system</h2>
        <p className="text-sm text-muted-foreground">
          The brackets are borrowed from the camera viewfinder. A device for
          content · not a logo.
        </p>
        <div className="flex flex-wrap items-center gap-8 border p-8">
          <Viewfinder>
            <span className="font-[family-name:var(--font-editorial)] italic text-2xl">
              Hassan Al Sarraf
            </span>
          </Viewfinder>
          <Viewfinder>
            <span className="font-display text-2xl">A Series of Quiet Things</span>
          </Viewfinder>
        </div>
        <ol className="grid gap-4 text-sm sm:grid-cols-3">
          <li className="border p-4">
            <span className="text-signal">RULE 01</span>
            <p className="mt-2">
              Brackets never touch the wordmark. They wrap content the brand
              presents — names, portraits, titles. MOMENTS always stands alone.
            </p>
          </li>
          <li className="border p-4">
            <span className="text-signal">RULE 02</span>
            <p className="mt-2">
              Brackets are hairline only. 0.4–0.6mm in print, 1–2px on screen.
              They suggest a frame; they never dominate it.
            </p>
          </li>
          <li className="border p-4">
            <span className="text-signal">RULE 03</span>
            <p className="mt-2">
              Brackets adapt aspect to what they hold. A square portrait gets a
              square. A film still gets 16:9. A name gets the rectangle of the
              name.
            </p>
          </li>
        </ol>
      </section>

      <footer className="border-t pt-6 text-center text-xs tracking-[0.3em] text-muted-foreground">
        MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
      </footer>
    </main>
  );
}
