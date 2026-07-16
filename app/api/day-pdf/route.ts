import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, renderUrlToPdf } from "@/lib/pdf";

// PDF rendering launches headless Chrome — allow up to 60s on serverless.
export const maxDuration = 60;

/** On-demand branded PDF of a day's shot list, call sheet, or to-do list
 *  (session-authed). */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const dayId = request.nextUrl.searchParams.get("day");
  const rawView = request.nextUrl.searchParams.get("view");
  const view = rawView === "call" || rawView === "todo" ? rawView : "shots";
  const lang = request.nextUrl.searchParams.get("lang") === "ar" ? "ar" : "en";
  if (!dayId) return new NextResponse("Missing day", { status: 400 });

  const { data: day } = await supabase
    .from("production_days")
    .select("share_key, day_date")
    .eq("id", dayId)
    .single();
  if (!day) return new NextResponse("Not found", { status: 404 });

  try {
    const origin = await appOrigin();
    const pdf = await renderUrlToPdf(
      `${origin}/print/day/${dayId}?key=${day.share_key}&view=${view}&lang=${lang}`,
      request.headers.get("cookie") ?? undefined
    );
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          view === "call" ? "call-sheet" : view === "todo" ? "todo-list" : "shot-list"
        }-${day.day_date}.pdf"`,
      },
    });
  } catch (e) {
    return new NextResponse(
      e instanceof Error ? e.message : "PDF generation failed",
      { status: 500 }
    );
  }
}
