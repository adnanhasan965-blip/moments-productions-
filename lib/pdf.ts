import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function appOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/** Print any internal page to an A4 PDF buffer via headless Chromium. */
export async function renderUrlToPdf(url: string): Promise<Uint8Array> {
  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });
  } finally {
    await browser.close();
  }
}

/**
 * Render a document's printable page and store the PDF in the
 * `documents` bucket. The printable page is the single source of
 * truth for layout, so the PDF always matches the web view.
 */
export async function generateDocumentPdf(documentId: string): Promise<{
  path?: string;
  error?: string;
}> {
  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("id, project_id, doc_number, share_key")
    .eq("id", documentId)
    .single();

  if (!doc) return { error: "Document not found" };

  try {
    const origin = await appOrigin();
    const pdf = await renderUrlToPdf(
      `${origin}/print/doc/${doc.id}?key=${doc.share_key}`
    );

    const path = `${doc.project_id}/${doc.doc_number}.pdf`;
    const { error } = await supabase.storage
      .from("documents")
      .upload(path, Buffer.from(pdf), {
        contentType: "application/pdf",
        upsert: true,
      });
    if (error) return { error: error.message };

    await supabase.from("documents").update({ pdf_path: path }).eq("id", doc.id);
    return { path };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "PDF generation failed" };
  }
}
