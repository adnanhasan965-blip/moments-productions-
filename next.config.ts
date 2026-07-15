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
};

export default withNextIntl(nextConfig);
