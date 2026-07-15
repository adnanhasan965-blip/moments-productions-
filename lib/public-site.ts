/** Content and helpers for the public marketing homepage. */

export interface Work {
  youtubeId: string;
  client: string;
  title: string;
}

/** Curated selected work from the 2026 company profile (client YouTube links). */
export const SELECTED_WORK: Work[] = [
  { youtubeId: "7aHIF6F-M-s", client: "Jahez GCC", title: "هزّ العالم" },
  { youtubeId: "I92Pdpcuk-o", client: "Zain", title: "ما يخلص" },
  { youtubeId: "mznZqx2GVYU", client: "FC Qadsiah", title: "القادسية نادينا" },
  { youtubeId: "vB7MY15AcRc", client: "TAM Bank", title: "نقاط وأكثر" },
  { youtubeId: "NJ13ahNpj7w", client: "Commercial Bank of Kuwait", title: "هذا عالمهم" },
  { youtubeId: "KzN2i1QRqwo", client: "Pizza Hut", title: "هلا بالعسل" },
  { youtubeId: "pqHU8M7pyIM", client: "Weyay Bank", title: "ولا مثلك بلد" },
  { youtubeId: "Bu_OM17Q0Og", client: "CBK", title: "كل صيف له قصة" },
];

export const CAPABILITIES = [
  {
    title: "Creative Strategy",
    body: "Ideas and creative directions that give every campaign a clear purpose.",
  },
  {
    title: "Brand Campaigns",
    body: "Integrated campaigns built to run across every platform.",
  },
  {
    title: "Film Production",
    body: "Commercials, branded films and documentaries, crafted end to end.",
  },
  {
    title: "Digital Content",
    body: "Content designed for digital-first audiences and social platforms.",
  },
  {
    title: "Original Entertainment",
    body: "TV formats, shows and original concepts made to be remembered.",
  },
];

export const PRINCIPLES = [
  ["People first", "Every great idea begins with understanding people."],
  ["Creativity with purpose", "Creativity should always solve, inspire and create value."],
  ["Story above everything", "Every brand deserves a story worth remembering."],
  ["Excellence in execution", "Great ideas deserve exceptional craftsmanship."],
  ["Build lasting trust", "Success is measured by relationships, not projects."],
  ["Never stop evolving", "Every project should raise the standard."],
] as const;

/** Client logos (public/clients/N.png), ordered like the company profile. */
export const CLIENT_LOGOS: { src: string; name: string }[] = [
  { src: "/clients/13.png", name: "Zain" },
  { src: "/clients/12.png", name: "National Bank of Kuwait" },
  { src: "/clients/7.png", name: "Al-Tijari — Commercial Bank of Kuwait" },
  { src: "/clients/8.png", name: "Warba Bank" },
  { src: "/clients/11.png", name: "Doha Bank" },
  { src: "/clients/20.png", name: "Bank of Kuwait" },
  { src: "/clients/17.png", name: "Gissah" },
  { src: "/clients/21.png", name: "FC Qadsiah" },
  { src: "/clients/14.png", name: "Weyay Bank" },
  { src: "/clients/15.png", name: "TAM Bank" },
  { src: "/clients/5.png", name: "International Hospital" },
  { src: "/clients/16.png", name: "Exeed" },
  { src: "/clients/18.png", name: "Jahez" },
  { src: "/clients/6.png", name: "Deer & Dear" },
  { src: "/clients/19.png", name: "NHC — Dr. Nael Alhazeem Center" },
  { src: "/clients/10.png", name: "Provin" },
  { src: "/clients/1.png", name: "Mask Off — The Show" },
  { src: "/clients/0.png", name: "Pizza Hut" },
  { src: "/clients/9.png", name: "Diet Station" },
  { src: "/clients/2.png", name: "Heal" },
  { src: "/clients/3.png", name: "Alfozan Speciality Dental Center" },
  { src: "/clients/4.png", name: "CALO" },
];

/** Bilingual copy for the public homepage. */
export const PUB = {
  nav_work: { en: "WORK", ar: "أعمالنا" },
  nav_about: { en: "ABOUT", ar: "من نحن" },
  nav_clients: { en: "CLIENTS", ar: "عملاؤنا" },
  nav_contact: { en: "CONTACT", ar: "تواصل" },
  hero_eyebrow: { en: "KUWAIT · THE WORLD", ar: "الكويت · إلى العالم" },
  hero_title: {
    en: "We create what people remember.",
    ar: "نصنع ما يتذكّره الناس.",
  },
  hero_sub: {
    en: "Every great brand has a story. We exist to make it unforgettable.",
    ar: "لكل علامة عظيمة قصة، ونحن هنا لنجعلها لا تُنسى.",
  },
  watch_showreel: { en: "WATCH SHOWREEL", ar: "شاهد أعمالنا" },
  start_project: { en: "START A PROJECT", ar: "ابدأ مشروعك" },
  showreel: { en: "SHOWREEL", ar: "العرض التقديمي" },
  about_eyebrow: { en: "WHO WE ARE", ar: "من نحن" },
  about_title: {
    en: "We turn ambitious ideas into experiences people remember.",
    ar: "نحوّل الأفكار الطموحة إلى تجارب يتذكّرها الناس.",
  },
  about_p1: {
    en: "Moments Productions is a creative company founded in Kuwait in 2024 with one ambition: to create work that people remember.",
    ar: "مومنتس برودكشنز شركة إبداعية تأسست في الكويت عام 2024 بطموح واحد: صناعة أعمال يتذكّرها الناس.",
  },
  about_p2: {
    en: "From cinematic campaigns and branded films to live experiences and original entertainment, we combine strategy, storytelling and exceptional execution to create work that moves people and leaves a lasting impression.",
    ar: "من الحملات السينمائية والأفلام الإعلانية إلى التجارب الحيّة والمحتوى الترفيهي الأصلي، نمزج الاستراتيجية وفنّ السرد والتنفيذ الاستثنائي لنصنع أعمالًا تحرّك الناس وتترك أثرًا يدوم.",
  },
  about_quote: {
    en: "We don't start with cameras, trends or deliverables. We start by understanding people.",
    ar: "لا نبدأ بالكاميرات ولا بالصيحات ولا بقوائم التسليم — نبدأ بفهم الناس.",
  },
  cap_eyebrow: { en: "WHAT WE CREATE", ar: "ماذا نصنع" },
  cap_tagline: { en: "Creativity with purpose.", ar: "إبداع له هدف." },
  work_eyebrow_latest: { en: "LATEST WORK", ar: "أحدث الأعمال" },
  work_eyebrow_selected: { en: "SELECTED WORK", ar: "أعمال مختارة" },
  work_title: { en: "The work.", ar: "أعمالنا." },
  clients_eyebrow: { en: "OUR CLIENTS", ar: "عملاؤنا" },
  clients_title: { en: "Built on trust", ar: "بُنيت على الثقة" },
  contact_eyebrow: { en: "CONTACT US", ar: "تواصل معنا" },
  contact_title: {
    en: "Let's create what's next.",
    ar: "لنصنع ما هو قادم.",
  },
  footer: {
    en: "MOMENTS PRODUCTIONS · KUWAIT · THE WORLD",
    ar: "مومنتس برودكشنز · الكويت · إلى العالم",
  },
  sign_in: { en: "SIGN IN", ar: "تسجيل الدخول" },
} as const;

export const CAPABILITIES_AR: { title: string; body: string }[] = [
  { title: "الاستراتيجية الإبداعية", body: "أفكار واتجاهات إبداعية تمنح كل حملة هدفًا واضحًا." },
  { title: "حملات العلامات التجارية", body: "حملات متكاملة مصمّمة للعمل عبر كل المنصات." },
  { title: "إنتاج الأفلام", body: "إعلانات وأفلام علامات تجارية ووثائقيات، مصنوعة من البداية للنهاية." },
  { title: "المحتوى الرقمي", body: "محتوى مصمّم لجمهور المنصات الرقمية أولًا." },
  { title: "الترفيه الأصلي", body: "برامج تلفزيونية وقوالب وأفكار أصلية صُنعت لتُتذكّر." },
];

export type PubLang = "en" | "ar";

export function pub(key: keyof typeof PUB, lang: PubLang): string {
  return PUB[key][lang];
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * Latest uploads from a YouTube channel via its public RSS feed
 * (no API key, auto-updates). Returns [] if unset or unreachable.
 */
export async function fetchChannelUploads(channelId: string): Promise<Work[]> {
  if (!channelId) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    return entries.slice(0, 8).map((e) => {
      const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      const title = (e.match(/<title>([^<]+)<\/title>/)?.[1] ?? "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"');
      return { youtubeId: id, client: "", title };
    });
  } catch {
    return [];
  }
}
