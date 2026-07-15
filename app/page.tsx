import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { YouTubeLite } from "@/components/public/youtube-lite";
import { PublicLangToggle } from "@/components/public/lang-toggle";
import { Reveal } from "@/components/public/reveal";
import {
  CAPABILITIES,
  CAPABILITIES_AR,
  CLIENT_LOGOS,
  SELECTED_WORK,
  fetchChannelUploads,
  pub,
  type PubLang,
  type Work,
} from "@/lib/public-site";

export const metadata: Metadata = {
  title: "Moments Productions — We create what people remember",
  description:
    "Moments Productions is a creative company founded in Kuwait. From cinematic campaigns and branded films to live experiences and original entertainment.",
};

interface PublicSettings {
  public_email: string;
  public_phone: string;
  public_phone_2: string;
  instagram_url: string;
  youtube_url: string;
  tiktok_url: string;
  linkedin_url: string;
  youtube_channel_id: string;
  showreel_youtube_id: string;
}

async function getSettings(): Promise<PublicSettings> {
  const fallback: PublicSettings = {
    public_email: "contact@momentskuwait.com",
    public_phone: "+965 6588 8826",
    public_phone_2: "+966 5800 87902",
    instagram_url: "https://instagram.com/momentskuwait",
    youtube_url: "",
    tiktok_url: "",
    linkedin_url: "",
    youtube_channel_id: "",
    showreel_youtube_id: "7aHIF6F-M-s",
  };
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("company_settings")
      .select(
        "public_email, public_phone, public_phone_2, instagram_url, youtube_url, tiktok_url, linkedin_url, youtube_channel_id, showreel_youtube_id"
      )
      .eq("id", 1)
      .single<PublicSettings>();
    return { ...fallback, ...(data ?? {}) };
  } catch {
    return fallback;
  }
}

function Section({
  id,
  eyebrow,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-20 sm:py-28 ${className}`}>
      {eyebrow && (
        <p className="mb-6 text-xs tracking-[0.35em] text-[var(--brand-signal)]">
          {eyebrow}
        </p>
      )}
      {children}
    </section>
  );
}

export default async function PublicHome() {
  const locale = await getLocale();
  const lang: PubLang = locale === "ar" ? "ar" : "en";
  const t = (key: Parameters<typeof pub>[0]) => pub(key, lang);
  const capabilities =
    lang === "ar"
      ? [...CAPABILITIES_AR]
      : CAPABILITIES.map((c) => ({ title: c.title, body: c.body }));

  const settings = await getSettings();
  const uploads = await fetchChannelUploads(settings.youtube_channel_id);
  const work: Work[] = uploads.length > 0 ? uploads : SELECTED_WORK;

  const socials = [
    ["Instagram", settings.instagram_url],
    ["YouTube", settings.youtube_url],
    ["TikTok", settings.tiktok_url],
    ["LinkedIn", settings.linkedin_url],
  ].filter(([, url]) => url) as [string, string][];

  return (
    <div className="bg-[var(--brand-black)] text-[var(--brand-cream)]">
      {/* ============ HERO ============ */}
      <header className="relative flex min-h-[92vh] flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <Image
            src="/brand/logo-dark.png"
            alt="Moments Productions"
            width={1200}
            height={436}
            className="h-14 w-auto sm:h-20"
            priority
          />
          <div className="flex items-center gap-6">
            <nav className="hidden gap-6 text-xs tracking-[0.2em] text-[var(--brand-cream)]/70 sm:flex">
              <a href="#work" className="hover:text-[var(--brand-cream)]">{t("nav_work")}</a>
              <a href="#about" className="hover:text-[var(--brand-cream)]">{t("nav_about")}</a>
              <a href="#clients" className="hover:text-[var(--brand-cream)]">{t("nav_clients")}</a>
              <a href="#contact" className="hover:text-[var(--brand-cream)]">{t("nav_contact")}</a>
            </nav>
            <PublicLangToggle current={lang} />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
          <Reveal as="p" className="text-xs tracking-[0.35em] text-[var(--brand-signal)]">
            {t("hero_eyebrow")}
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-4 max-w-4xl text-6xl leading-[0.95] sm:text-8xl">
            {t("hero_title")}
          </Reveal>
          <Reveal
            as="p"
            delay={220}
            className="mt-6 max-w-xl font-[family-name:var(--font-editorial)] text-xl italic text-[var(--brand-cream)]/75 sm:text-2xl"
          >
            {t("hero_sub")}
          </Reveal>
          <Reveal delay={340} className="mt-10 flex flex-wrap gap-4">
            <a
              href="#showreel"
              className="bg-[var(--brand-signal)] px-6 py-3 text-sm tracking-widest text-[var(--brand-cream)] transition hover:brightness-110"
            >
              {t("watch_showreel")}
            </a>
            <a
              href="#contact"
              className="border border-[var(--brand-cream)]/40 px-6 py-3 text-sm tracking-widest transition hover:bg-[var(--brand-cream)]/10"
            >
              {t("start_project")}
            </a>
          </Reveal>
        </div>
      </header>

      {/* ============ SHOWREEL ============ */}
      <Section id="showreel" eyebrow={t("showreel")} className="!py-16">
        <Reveal className="viewfinder p-1.5">
          <span className="vf absolute inset-0 text-[var(--brand-cream)]/50" />
          <YouTubeLite id={settings.showreel_youtube_id} label="Showreel" />
        </Reveal>
      </Section>

      {/* ============ WHO WE ARE ============ */}
      <Section id="about" eyebrow={t("about_eyebrow")}>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <Reveal as="h2" className="text-4xl sm:text-6xl">
            {t("about_title")}
          </Reveal>
          <Reveal delay={120} className="space-y-5 text-[var(--brand-cream)]/75">
            <p>{t("about_p1")}</p>
            <p>{t("about_p2")}</p>
            <p className="font-[family-name:var(--font-editorial)] text-lg italic text-[var(--brand-cream)]">
              {t("about_quote")}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ============ CAPABILITIES ============ */}
      <Section eyebrow={t("cap_eyebrow")} className="border-t border-[var(--brand-cream)]/10">
        <div className="grid gap-px border border-[var(--brand-cream)]/15 bg-[var(--brand-cream)]/15 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <Reveal
              key={c.title}
              delay={i * 80}
              className="bg-[var(--brand-black)] p-8 transition-colors hover:bg-[var(--brand-cream)]/5"
            >
              <h3 className="text-2xl">{c.title}</h3>
              <p className="mt-3 text-sm text-[var(--brand-cream)]/65">{c.body}</p>
            </Reveal>
          ))}
          <Reveal
            delay={capabilities.length * 80}
            className="flex items-end bg-[var(--brand-signal)] p-8"
          >
            <p className="font-[family-name:var(--font-editorial)] text-2xl italic">
              {t("cap_tagline")}
            </p>
          </Reveal>
        </div>
      </Section>

      {/* ============ WORK ============ */}
      <Section
        id="work"
        eyebrow={uploads.length ? t("work_eyebrow_latest") : t("work_eyebrow_selected")}
      >
        <h2 className="mb-10 text-4xl sm:text-6xl">{t("work_title")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {work.map((w, i) => (
            <Reveal as="figure" key={w.youtubeId} delay={(i % 3) * 90}>
              <YouTubeLite id={w.youtubeId} label={w.title} />
              <figcaption className="mt-3">
                {w.client && (
                  <p className="text-xs tracking-[0.2em] text-[var(--brand-signal)]" dir="ltr">
                    {w.client.toUpperCase()}
                  </p>
                )}
                <p
                  className="mt-1 text-lg"
                  dir="auto"
                  style={{ fontFamily: "var(--font-arabic), var(--font-jetbrains)" }}
                >
                  {w.title}
                </p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============ CLIENTS ============ */}
      <Section
        id="clients"
        eyebrow={t("clients_eyebrow")}
        className="border-t border-[var(--brand-cream)]/10"
      >
        <Reveal as="h2" className="mb-12 text-5xl sm:text-7xl">
          {t("clients_title")}
          <span className="text-[var(--brand-signal)]">.</span>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {CLIENT_LOGOS.map((c, i) => (
            <Reveal key={c.src} delay={(i % 4) * 70}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.src}
                alt={c.name}
                title={c.name}
                loading="lazy"
                className="mx-auto h-12 w-full max-w-40 object-contain opacity-75 transition hover:opacity-100 sm:h-14"
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============ CONTACT ============ */}
      <Section
        id="contact"
        eyebrow={t("contact_eyebrow")}
        className="border-t border-[var(--brand-cream)]/10"
      >
        <Reveal as="h2" className="text-5xl sm:text-8xl">
          {t("contact_title")}
        </Reveal>
        <Reveal delay={120} className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="space-y-4">
            <a
              href={`mailto:${settings.public_email}`}
              className="block text-2xl hover:text-[var(--brand-signal)]"
              dir="ltr"
            >
              {settings.public_email}
            </a>
            <p className="text-lg text-[var(--brand-cream)]/75" dir="ltr">
              {settings.public_phone}
            </p>
            {settings.public_phone_2 && (
              <p className="text-lg text-[var(--brand-cream)]/75" dir="ltr">
                {settings.public_phone_2}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-start gap-4">
            {socials.map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="border border-[var(--brand-cream)]/40 px-5 py-2.5 text-sm tracking-widest hover:bg-[var(--brand-cream)]/10"
              >
                {name.toUpperCase()}
              </a>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[var(--brand-cream)]/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs tracking-[0.2em] text-[var(--brand-cream)]/45">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {t("footer")}
            <span aria-hidden>·</span>
            <Link
              href="/dashboard"
              className="text-[var(--brand-cream)]/70 underline underline-offset-4 hover:text-[var(--brand-signal)]"
            >
              {t("sign_in")}
            </Link>
          </span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
