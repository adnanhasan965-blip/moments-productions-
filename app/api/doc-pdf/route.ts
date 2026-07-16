import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appOrigin, renderUrlToPdf } from "@/lib/pdf";

// May need to launch headless Chrome — allow up to 60s on serverless.
export const maxDuration = 60;

/** Direct download of a receipt/invoice PDF (session-authed).
 *  Serves the stored PDF when one exists; otherwise renders the printable
 *  page on the fly, so the button always works. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const docId = request.nextUrl.searchParams.get("doc");
  if (!docId) return new NextResponse("Missing doc", { status: 400 });

  const { data: doc } = await supabase
    .from("documents")
    .select("id, doc_number, share_key, pdf_path")
    .eq("id", docId)
    .single();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${doc.doc_number}.pdf"`,
  };

  try {
    if (doc.pdf_path) {
      const { data: file } = await supabase.storage
        .from("documents")
        .download(doc.pdf_path);
      if (file) {
        return new NextResponse(Buffer.from(await file.arrayBuffer()), { headers });
      }
      // stored file missing → fall through and render fresh
    }

    const origin = await appOrigin();
    const pdf = await renderUrlToPdf(
      `${origin}/print/doc/${doc.id}?key=${doc.share_key}`,
      request.headers.get("cookie") ?? undefined
    );
    return new NextResponse(Buffer.from(pdf), { headers });
  } catch (e) {
    return new NextResponse(
      e instanceof Error ? e.message : "PDF download failed",
      { status: 500 }
    );
  }
}
