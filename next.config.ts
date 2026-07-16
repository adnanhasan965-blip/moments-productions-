import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // receipt photo uploads travel through server actions
      bodySizeLimit: "10mb",
    },
  },
  // Headless-Chrome packages must stay external so Next traces their
  // binaries correctly (local: puppeteer; serverless: @sparticuz/chromium).
  // Only the serverless Chrome packages are externalized. Full `puppeteer`
  // (local dev only) is deliberately NOT here — it's a turbopackIgnore'd
  // dynamic import in lib/pdf.ts so it never loads inside the Vercel bundle.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  // @sparticuz/chromium reads its compressed Chromium binary from bin/*.br
  // at runtime via a computed path, so file-tracing doesn't see it as an
  // import and drops it from the serverless bundle ("input directory
  // .../@sparticuz/chromium/bin does not exist"). Force those files into
  // the functions that launch Chromium: the day/schedule/booklet/finance
  // PDF API routes, and the project routes (document "Make PDF" runs there
  // as a server action).
  outputFileTracingIncludes: {
    "/api/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
    "/projects/**": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
};

export default withNextIntl(nextConfig);
