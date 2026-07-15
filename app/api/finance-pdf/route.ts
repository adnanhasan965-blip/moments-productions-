import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, renderUrlToPdf } from "@/lib/pdf";

/** On-demand branded PDF of a project's full finance picture
 *  (budget, costs, crew) — session-authed. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const projectId = request.nextUrl.searchParams.get("project");
  if (!projectId) return new NextResponse("Missing project", { status: 400 });
  const lang = request.nextUrl.searchParams.get("lang") === "ar" ? "ar" : "en";

  const { data: project } = await supabase
    .from("projects")
    .select("share_key, name")
    .eq("id", projectId)
    .single();
  if (!project) return new NextResponse("Not found", { status: 404 });

  try {
    const origin = await appOrigin();
    const pdf = await renderUrlToPdf(
      `${origin}/print/finance/${projectId}?key=${project.share_key}&lang=${lang}`
    );
    const safeName = project.name.replace(/[^\w-]+/g, "_");
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}_finance.pdf"`,
      },
    });
  } catch (e) {
    return new NextResponse(
      e instanceof Error ? e.message : "PDF generation failed",
      { status: 500 }
    );
  }
}
