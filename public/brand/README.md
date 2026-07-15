# Brand assets

Source of truth: brand-book.pdf (April 2026 final). Colors and rules live as
CSS variables in `app/globals.css`; fonts are wired in `lib/fonts.ts`.

| File | Notes |
|---|---|
| `logo.png` | Black wordmark, transparent — for cream/light grounds and PDFs. Auto-trimmed from "MOMENTS new logo white no BG.png". |
| `logo-dark.png` | White wordmark, transparent — for black and signal-red grounds. |
| `fonts/BebasNeue-*.otf` | Display voice (headings, wordmark). |
| `fonts/JetBrainsMono-*.ttf` | Technical voice (UI, tables, numbers). Variable fonts. |

Instrument Serif (editorial) and IBM Plex Sans Arabic (RTL) load from Google
Fonts via `next/font/google`.

Palette — three values only, no greys, no tints:
Black `#000000` · Signal `#E50914` · Cream `#F5F0E8`.
