import localFont from "next/font/local";
import { Instrument_Serif, IBM_Plex_Sans_Arabic } from "next/font/google";

/** DISPLAY · wordmark & headings — Bebas Neue */
export const bebas = localFont({
  src: [
    { path: "../public/brand/fonts/BebasNeue-Regular.otf", weight: "400", style: "normal" },
    { path: "../public/brand/fonts/BebasNeue-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-bebas",
  display: "swap",
});

/** TECHNICAL · UI, tables, numbers — JetBrains Mono (variable) */
export const jetbrains = localFont({
  src: [
    {
      path: "../public/brand/fonts/JetBrainsMono-Variable.ttf",
      weight: "100 800",
      style: "normal",
    },
    {
      path: "../public/brand/fonts/JetBrainsMono-Italic-Variable.ttf",
      weight: "100 800",
      style: "italic",
    },
  ],
  variable: "--font-jetbrains",
  display: "swap",
  // No synthetic Arial fallback: Arial has Arabic glyphs and would hijack
  // Arabic text before it reaches the Arabic face in the stack.
  adjustFontFallback: false,
});

/** EDITORIAL · names + tagline — Instrument Serif Italic */
export const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
});

/** ARABIC · RTL pairing (brand book has no Arabic face) — IBM Plex Sans Arabic */
export const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
});
