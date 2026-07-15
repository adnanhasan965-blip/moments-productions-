"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/locale-actions";

/** EN / العربية toggle for the public page (cream-on-black styling). */
export function PublicLangToggle({ current }: { current: "en" | "ar" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const next = current === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      className="border border-[var(--brand-cream)]/40 px-3 py-1.5 text-xs tracking-widest text-[var(--brand-cream)] hover:bg-[var(--brand-cream)]/10"
      aria-label={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      {next === "ar" ? "العربية" : "EN"}
    </button>
  );
}
