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
  serverExternalPackages: ["puppeteer", "puppeteer-core", "@sparticuz/chromium"],
};

export default withNextIntl(nextConfig);
