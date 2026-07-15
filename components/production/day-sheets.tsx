import Image from "next/image";
import { formatDate } from "@/lib/format";
import {
  dayTypeLabel,
  sheetLabel,
  type CallSheet,
  type ProductionDay,
  type SheetLang,
  type Shot,
} from "@/lib/production";

function SheetShell({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: SheetLang;
}) {
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
      className="relative mx-auto w-full max-w-[190mm] bg-[#F5F0E8] p-5 sm:p-10 print:min-h-[277mm] print:w-[190mm] text-black"
    >
      {children}
      <footer className="mt-16 border-t border-black/20 pt-4 text-center text-[10px] tracking-[0.3em] text-black/55">
        MOMENTS PRODUCTIONS · KUWAIT · THE WORLD
      </footer>
    </div>
  );
}

function SheetHeader({
  day,
  projectName,
  title,
  subtitle,
  lang,
  clientLogoUrl,
}: {
  day: ProductionDay;
  projectName: string;
  title: string;
  subtitle?: string;
  lang: SheetLang;
  clientLogoUrl?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-6">
      <div>
        <Image
          src="/brand/logo.png"
          alt="Moments Productions"
          width={1200}
          height={436}
          className="h-12 w-auto"
          priority
        />
        <p className="mt-2 text-sm font-bold">{projectName}</p>
        <p className="text-xs text-black/55">
          {formatDate(day.day_date, lang)} · {dayTypeLabel(day.day_type, lang)}
          {day.title ? ` · ${day.title}` : ""}
        </p>
      </div>
      <div className="text-end">
        <h1 className="text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}
        {clientLogoUrl && (
          /* client logo — shown on day documents (web + PDF) */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clientLogoUrl}
            alt=""
            className="ms-auto mt-3 h-12 w-44 object-contain object-right"
          />
        )}
      </div>
    </header>
  );
}

export function ShotListSheet({
  day,
  shots,
  projectName,
  lang = "en",
  clientLogoUrl,
}: {
  day: ProductionDay;
  shots: Shot[];
  projectName: string;
  lang?: SheetLang;
  clientLogoUrl?: string;
}) {
  const totalMin = shots.reduce((s, x) => s + (x.estimated_minutes ?? 0), 0);
  return (
    <SheetShell lang={lang}>
      <div className="space-y-8">
        <SheetHeader
          day={day}
          projectName={projectName}
          title={sheetLabel("shot_list", lang)}
          subtitle={`${shots.length} ${sheetLabel("shots_count", lang)} · ~${Math.floor(totalMin / 60)}h ${totalMin % 60}m`}
          lang={lang}
          clientLogoUrl={clientLogoUrl}
        />
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-y border-black text-[10px] tracking-[0.15em] text-black/55">
              <th className="py-2 pe-2 text-start">#</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("scene", lang)}</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("size", lang)}</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("description", lang)}</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("camera", lang)}</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("location_col", lang)}</th>
              <th className="py-2 pe-2 text-start">{sheetLabel("cast_col", lang)}</th>
              <th className="py-2 pe-2 text-end">{sheetLabel("time_col", lang)}</th>
              <th className="py-2 pe-2 text-end">{sheetLabel("est", lang)}</th>
              <th className="py-2 text-center">✓</th>
            </tr>
          </thead>
          <tbody>
            {shots.map((s) => (
              <tr key={s.id} className="border-b border-black/15 align-top">
                <td className="py-2 pe-2 font-bold">{s.shot_number}</td>
                <td className="py-2 pe-2">{s.scene}</td>
                <td className="py-2 pe-2">{s.shot_size}</td>
                <td className="py-2 pe-2">{s.description}</td>
                <td className="py-2 pe-2">{s.camera_notes}</td>
                <td className="py-2 pe-2">{s.location}</td>
                <td className="py-2 pe-2">{s.cast_subjects}</td>
                <td className="py-2 pe-2 text-end whitespace-nowrap font-bold">
                  {s.planned_time?.slice(0, 5) ?? ""}
                </td>
                <td className="py-2 pe-2 text-end whitespace-nowrap">
                  {s.estimated_minutes ? `${s.estimated_minutes}m` : ""}
                </td>
                <td className="py-2 text-center">
                  <span
                    className={`inline-block h-3 w-3 border border-black ${
                      s.status === "done" ? "bg-black" : ""
                    }`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {day.notes && (
          <p className="text-xs">
            <span className="text-black/55">{sheetLabel("notes", lang)}: </span>
            {day.notes}
          </p>
        )}
      </div>
    </SheetShell>
  );
}

export function CallSheetSheet({
  day,
  callSheet,
  projectName,
  lang = "en",
  clientLogoUrl,
}: {
  day: ProductionDay;
  callSheet: CallSheet;
  projectName: string;
  lang?: SheetLang;
  clientLogoUrl?: string;
}) {
  const cs = callSheet;
  return (
    <SheetShell lang={lang}>
      <div className="space-y-8">
        <SheetHeader
          day={day}
          projectName={projectName}
          title={sheetLabel("call_sheet", lang)}
          subtitle={
            cs.day_number && cs.total_days
              ? sheetLabel("day_of", lang)
                  .replace("{n}", String(cs.day_number))
                  .replace("{total}", String(cs.total_days))
              : undefined
          }
          lang={lang}
          clientLogoUrl={clientLogoUrl}
        />

        <div className="viewfinder flex flex-wrap items-center justify-between gap-6 p-6">
          <span className="vf absolute inset-0" />
          <div>
            <p className="text-[10px] tracking-[0.25em] text-black/55">
              {sheetLabel("general_call", lang)}
            </p>
            <p className="text-4xl">{cs.general_call_time?.slice(0, 5) ?? "TBC"}</p>
          </div>
          {day.locations.length > 0 && (
            <div className="text-sm">
              <p className="text-[10px] tracking-[0.25em] text-black/55">
                {day.locations.length > 1
                  ? sheetLabel("locations", lang)
                  : sheetLabel("location", lang)}
              </p>
              {day.locations.map((l, i) => (
                <p key={i}>
                  {l.name}
                  {l.map_link && (
                    <>
                      {" · "}
                      <a href={l.map_link} className="underline">
                        {sheetLabel("map", lang)}
                      </a>
                    </>
                  )}
                </p>
              ))}
            </div>
          )}
          {cs.weather_note && (
            <div className="text-sm">
              <p className="text-[10px] tracking-[0.25em] text-black/55">{sheetLabel("weather", lang)}</p>
              <p>{cs.weather_note}</p>
            </div>
          )}
        </div>

        {cs.key_contacts.length > 0 && (
          <section>
            <h2 className="mb-2 text-xl">{sheetLabel("key_contacts", lang)}</h2>
            <div className="grid gap-x-8 text-sm sm:grid-cols-2">
              {cs.key_contacts.map((c, i) => (
                <p key={i} className="flex justify-between border-b border-black/15 py-1.5">
                  <span>
                    <span className="text-black/55">{c.role}</span> {c.name}
                  </span>
                  <span dir="ltr">{c.phone}</span>
                </p>
              ))}
            </div>
          </section>
        )}

        {cs.schedule.length > 0 && (
          <section>
            <h2 className="mb-2 text-xl">{sheetLabel("schedule", lang)}</h2>
            <table className="w-full text-sm">
              <tbody>
                {cs.schedule.map((r, i) => (
                  <tr key={i} className="border-b border-black/15">
                    <td className="w-20 py-1.5 font-bold">{r.time?.slice(0, 5)}</td>
                    <td className="py-1.5">{r.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {cs.crew_calls.length > 0 && (
          <section>
            <h2 className="mb-2 text-xl">{sheetLabel("crew", lang)}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black text-[10px] tracking-[0.15em] text-black/55">
                  <th className="py-1.5 text-start">{sheetLabel("name", lang)}</th>
                  <th className="py-1.5 text-start">{sheetLabel("role", lang)}</th>
                  <th className="py-1.5 text-start">{sheetLabel("phone", lang)}</th>
                  <th className="py-1.5 text-end">{sheetLabel("call", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {cs.crew_calls.map((c, i) => (
                  <tr key={i} className="border-b border-black/15">
                    <td className="py-1.5">{c.name}</td>
                    <td className="py-1.5">{c.role}</td>
                    <td className="py-1.5" dir="ltr">{c.phone}</td>
                    <td className="py-1.5 text-end font-bold">
                      {c.call_time?.slice(0, 5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {cs.cast_list.length > 0 && (
          <section>
            <h2 className="mb-2 text-xl">{sheetLabel("cast", lang)}</h2>
            <table className="w-full text-sm">
              <tbody>
                {cs.cast_list.map((c, i) => (
                  <tr key={i} className="border-b border-black/15">
                    <td className="py-1.5">{c.name}</td>
                    <td className="py-1.5 text-black/55">{c.role}</td>
                    <td className="py-1.5 text-end font-bold">
                      {c.call_time?.slice(0, 5)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {(cs.notes || day.notes) && (
          <section className="text-sm">
            <h2 className="mb-2 text-xl">{sheetLabel("notes", lang)}</h2>
            <p className="whitespace-pre-wrap">{cs.notes || day.notes}</p>
          </section>
        )}
      </div>
    </SheetShell>
  );
}
