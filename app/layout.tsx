import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { bebas, jetbrains, instrumentSerif, plexArabic } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moments Productions",
  description: "Production management for Moments Productions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${bebas.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
